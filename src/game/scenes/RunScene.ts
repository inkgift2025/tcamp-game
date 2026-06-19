import Phaser from 'phaser';
import { balanceConfig } from '../config/balanceConfig';
import { DEBUG_HITBOXES, GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { RunStageConfig } from '../config/stageConfig';
import { BouncePad } from '../objects/BouncePad';
import { Collectible } from '../objects/Collectible';
import { DataPlatform } from '../objects/DataPlatform';
import { GooseAI } from '../objects/GooseAI';
import { GooseShadow } from '../objects/GooseShadow';
import { Obstacle } from '../objects/Obstacle';
import { Player } from '../objects/Player';
import { SupplyCrate } from '../objects/SupplyCrate';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { PressureSystem } from '../systems/PressureSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SoundSystem } from '../systems/SoundSystem';
import { SegmentPlan, SpawnSystem } from '../systems/SpawnSystem';
import { StageSystem } from '../systems/StageSystem';
import { createHudOverlay } from '../../ui/hudOverlay';
import { HudOverlayHandle } from '../../ui/uiTypes';

type KeyMap = Record<
  'jump1' | 'jump2' | 'jump3' | 'slide1' | 'slide2' | 'restart' | 'pause',
  Phaser.Input.Keyboard.Key
>;

export class RunScene extends Phaser.Scene {
  private player!: Player;
  private goose!: GooseShadow;
  private gooseAI!: GooseAI;
  private pressure!: PressureSystem;
  private score!: ScoreSystem;
  private spawner!: SpawnSystem;
  private stageSystem!: StageSystem;
  private currentStage!: RunStageConfig;
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private platforms: DataPlatform[] = [];
  private bouncePads: BouncePad[] = [];
  private crates: SupplyCrate[] = [];
  private keys!: KeyMap;
  private speed = balanceConfig.run.baseSpeed;
  private isGameOver = false;
  private isPaused = false;
  private nextDangerAlarmAt = 0;
  private shardCombo = 0;
  private comboResetAt = 0;
  private nextDashAt = 62;
  private dashActive = false;
  private dashEndsAt = 0;
  private nextDashSegmentAt = 0;
  private dashHits = 0;
  private background!: BackgroundSystem;
  private hud!: HudOverlayHandle;
  private pauseOverlay?: Phaser.GameObjects.Container;

  private alarmGraphics!: Phaser.GameObjects.Graphics;
  private debugGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super('RunScene');
  }

  create(): void {
    this.speed = balanceConfig.run.baseSpeed;
    this.isGameOver = false;
    this.isPaused = false;
    this.nextDangerAlarmAt = 0;
    this.nextDashAt = 62;
    this.dashActive = false;
    this.dashHits = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.platforms = [];
    this.bouncePads = [];
    this.crates = [];

    this.pressure = new PressureSystem();
    this.score = new ScoreSystem();
    this.spawner = new SpawnSystem(this);
    this.stageSystem = new StageSystem();
    this.currentStage = this.stageSystem.getCurrentStage();

    this.background = new BackgroundSystem(this, this.currentStage);
    this.alarmGraphics = this.add.graphics().setDepth(21);

    this.player = new Player(this);
    this.goose = new GooseShadow(this);
    this.gooseAI = new GooseAI(this);

    this.physics.add.collider(this.player.hitbox, this.createGroundCollider());
    this.hud = createHudOverlay({
      onTogglePause: () => this.togglePause(),
      onReturnHome: () => this.returnToStart(),
    });
    this.createKeys();
    this.showStageBanner(this.currentStage);
    if (DEBUG_HITBOXES) {
      this.debugGraphics = this.add.graphics().setDepth(80);
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupScene());
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    this.updateInput();
    if (this.isPaused) {
      return;
    }

    this.score.update(delta);
    this.registry.set('runTimeSeconds', this.score.getAliveSeconds());
    this.registry.set('pressureValue', this.pressure.getValue());

    const stageUpdate = this.stageSystem.update(this.score.getAliveSeconds());
    if (stageUpdate.changed) {
      this.currentStage = stageUpdate.stage;
      this.background.setStage(stageUpdate.stage);
      this.showStageBanner(stageUpdate.stage);
      this.spawnStageShowcase(stageUpdate.stage);
    }

    this.speed = Math.min(
      balanceConfig.run.maxSpeed + this.currentStage.maxSpeedBonus,
      this.speed + (balanceConfig.run.speedGainPerSecond * this.currentStage.speedGainMultiplier * delta) / 1000,
    );
    if (this.score.getAliveSeconds() >= balanceConfig.run.successSeconds) {
      this.completeRun();
      return;
    }

    this.updateDashEvent(time);
    this.background.update(time, this.pressure.getRatio(), this.dashActive);

    const segment = this.spawner.update(delta, this.speed, this.currentStage, this.countActiveDanger());
    if (segment) {
      this.spawnSegment(segment);
    }

    this.player.update(time);
    this.goose.update(Math.min(1, this.pressure.getRatio() + (this.dashActive ? 0.22 : 0)), this.player.hitbox.x, time);
    this.gooseAI.update(delta, {
      playerX: this.player.hitbox.x,
      playerY: this.player.hitbox.y,
      playerAction: this.player.currentAction,
      pressureValue: this.getPressureValue(),
      isGameOver: this.isGameOver,
    });
    if (this.pressure.isCritical()) {
      this.gooseAI.catchPlayer(this.player.hitbox.x, this.player.hitbox.y);
      this.endRun('failure');
      return;
    }
    this.updatePlatforms(time);
    this.updateBouncePads(time);
    this.updateCrates(time);
    this.updateObstacles(time);
    this.updateCollectibles(time);
    this.updateDangerAlarm(time);
    this.updateHud(time);
    this.updateDebugHitboxes();
  }

  private updateInput(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
      return;
    }

    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
        this.restartRun();
      }
      return;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.jump1) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump2) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump3)
    ) {
      if (this.player.jump()) {
        SoundSystem.playJump();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.slide1) || Phaser.Input.Keyboard.JustDown(this.keys.slide2)) {
      if (this.player.startSlide()) {
        SoundSystem.playSlide();
      }
    }

    if (
      (Phaser.Input.Keyboard.JustUp(this.keys.slide1) || Phaser.Input.Keyboard.JustUp(this.keys.slide2)) &&
      !this.keys.slide1.isDown &&
      !this.keys.slide2.isDown
    ) {
      this.player.stopSlide();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
      this.restartRun();
    }
  }

  private togglePause(): void {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.hud.setPaused(this.isPaused);

    if (this.isPaused) {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.showPauseOverlay();
      return;
    }

    this.time.paused = false;
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
    this.physics.world.resume();
    this.tweens.resumeAll();
  }

  private restartRun(): void {
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    this.scene.restart();
  }

  private returnToStart(): void {
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    this.cleanupDom();
    this.scene.start('StartScene');
  }

  private showPauseOverlay(): void {
    this.pauseOverlay?.destroy();
    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x020714, 0.42);
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, 214, 360, 128, 0x07143a, 0.86)
      .setStrokeStyle(2, 0x4debff, 0.72);
    const title = this.add
      .text(GAME_WIDTH / 2, 186, '已暂停', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '30px',
        color: '#f8fbff',
        fontStyle: 'bold',
        stroke: '#071028',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(GAME_WIDTH / 2, 226, '点击“继续”或按 P 返回游戏', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '16px',
        color: '#bdefff',
      })
      .setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [shade, panel, title, hint]).setDepth(60);
  }

  private spawnSegment(segment: SegmentPlan): void {
    for (const platform of segment.platforms) {
      const dataPlatform = new DataPlatform(
        this,
        segment.x + platform.xOffset,
        platform.y,
        platform.width,
        this.speed,
        Boolean(platform.sinking),
      );
      this.physics.add.collider(this.player.hitbox, dataPlatform.hitbox, () => dataPlatform.stepOn(this.time.now));
      this.platforms.push(dataPlatform);
    }

    for (const pad of segment.bouncePads) {
      this.bouncePads.push(new BouncePad(this, segment.x + pad.xOffset, pad.y, this.speed));
    }

    for (const crate of segment.crates) {
      this.crates.push(new SupplyCrate(this, segment.x + crate.xOffset, crate.y, this.speed));
    }

    for (const obstacle of segment.obstacles) {
      this.obstacles.push(new Obstacle(this, obstacle.type, segment.x + obstacle.xOffset, this.speed));
    }

    for (const collectible of segment.collectibles) {
      this.collectibles.push(
        new Collectible(this, collectible.type, segment.x + collectible.xOffset, this.speed, collectible.y),
      );
    }
  }

  private spawnStageShowcase(stage: RunStageConfig): void {
    if (stage.id === 'data-corridor') {
      this.spawnSegment({
        kind: 'platform-reward',
        x: GAME_WIDTH + 160,
        obstacles: [],
        collectibles: [
          { type: 'inspiration-shard', xOffset: 110, y: GROUND_Y - 198 },
          { type: 'inspiration-shard', xOffset: 154, y: GROUND_Y - 218 },
          { type: 'inspiration-shard', xOffset: 198, y: GROUND_Y - 198 },
          { type: 'energy-orb', xOffset: 292, y: GROUND_Y - 220 },
        ],
        platforms: [{ xOffset: 120, y: GROUND_Y - 138, width: 190 }],
        bouncePads: [{ xOffset: 0, y: GROUND_Y - 12 }],
        crates: [{ xOffset: 360, y: GROUND_Y - 178 }],
      });
      return;
    }

    if (stage.id === 'energy-pipeline') {
      this.spawnSegment({
        kind: 'laser-rhythm',
        x: GAME_WIDTH + 160,
        obstacles: [
          { type: 'data-crack', xOffset: 120 },
          { type: 'laser-gate', xOffset: 390 },
        ],
        collectibles: [
          { type: 'inspiration-shard', xOffset: 0, y: GROUND_Y - 124 },
          { type: 'inspiration-shard', xOffset: 52, y: GROUND_Y - 162 },
          { type: 'inspiration-shard', xOffset: 104, y: GROUND_Y - 188 },
          { type: 'inspiration-shard', xOffset: 156, y: GROUND_Y - 162 },
        ],
        platforms: [{ xOffset: 230, y: GROUND_Y - 126, width: 160, sinking: true }],
        bouncePads: [],
        crates: [],
      });
    }
  }

  private updateObstacles(time: number): void {
    for (const obstacle of this.obstacles) {
      obstacle.update(this.speed, time);

      if (!obstacle.passed && obstacle.hitbox.x < this.player.hitbox.x - 55) {
        obstacle.passed = true;
        this.score.addObstacleClear();
      }

      if (
        !obstacle.hasHit &&
        this.physics.overlap(this.player.hitbox, obstacle.hitbox) &&
        !this.player.isInvulnerable(time)
      ) {
        this.handleHit(obstacle, time);
        if (this.isGameOver) {
          break;
        }
      }
    }

    this.obstacles = this.obstacles.filter((obstacle) => {
      if (obstacle.isOffscreen(balanceConfig.run.obstacleCleanupX)) {
        obstacle.destroy();
        return false;
      }
      return true;
    });
  }

  private updatePlatforms(time: number): void {
    for (const platform of this.platforms) {
      platform.update(this.speed, time);
    }
    this.platforms = this.platforms.filter((platform) => {
      if (platform.isOffscreen(balanceConfig.run.obstacleCleanupX)) {
        platform.destroy();
        return false;
      }
      return true;
    });
  }

  private updateBouncePads(time: number): void {
    for (const pad of this.bouncePads) {
      pad.update(this.speed, time);
      if (
        this.physics.overlap(this.player.hitbox, pad.hitbox) &&
        this.player.body.velocity.y >= 0 &&
        this.player.hitbox.y < pad.hitbox.y - 4
      ) {
        this.player.bounce();
        pad.trigger(time);
        SoundSystem.playJump();
        this.emitCollectibleFeedback(pad.hitbox.x, pad.hitbox.y - 18, '弹跳节点', 0x65fff4);
      }
    }
    this.bouncePads = this.bouncePads.filter((pad) => {
      if (pad.isOffscreen(balanceConfig.run.obstacleCleanupX)) {
        pad.destroy();
        return false;
      }
      return true;
    });
  }

  private updateCrates(time: number): void {
    for (const crate of this.crates) {
      crate.update(this.speed, time);
      if (!crate.isOpened() && this.physics.overlap(this.player.hitbox, crate.hitbox)) {
        crate.open();
        this.openCrate(crate.hitbox.x, crate.hitbox.y);
      }
    }
    this.crates = this.crates.filter((crate) => {
      if (crate.isOffscreen(balanceConfig.run.obstacleCleanupX)) {
        crate.destroy();
        return false;
      }
      return true;
    });
  }

  private openCrate(x: number, y: number): void {
    SoundSystem.playInspirationShard();
    this.emitCollectibleFeedback(x, y - 12, '补给展开', 0x7af7ff);
    if (Math.random() < 0.18) {
      this.collectibles.push(new Collectible(this, 'energy-orb', x + 20, this.speed, y + 42));
      return;
    }
    for (let i = 0; i < 3; i += 1) {
      this.collectibles.push(new Collectible(this, 'inspiration-shard', x - 38 + i * 38, this.speed, y + 34));
    }
  }

  private handleHit(obstacle: Obstacle, time: number): void {
    obstacle.hasHit = true;
    const amount =
      obstacle.type === 'laser-gate'
        ? balanceConfig.pressure.laserGateHit
        : balanceConfig.pressure.dataBarrierHit;
    this.pressure.add(amount + (this.dashActive ? balanceConfig.pressure.dashHitPenalty : 0));
    if (this.dashActive) {
      this.dashHits += 1;
    }
    SoundSystem.playHit();
    this.player.hit(time);
    this.cameras.main.shake(this.dashActive ? 220 : 160, this.dashActive ? 0.012 : 0.008);
    this.flashPressure();

    if (this.pressure.isCritical()) {
      this.endRun('failure');
    }
  }

  private updateCollectibles(time: number): void {
    if (time > this.comboResetAt) {
      this.shardCombo = 0;
    }

    for (const collectible of this.collectibles) {
      collectible.update(this.speed, time);

      if (!collectible.isCollected() && this.physics.overlap(this.player.hitbox, collectible.hitbox)) {
        this.handleCollectible(collectible, time);
      }
    }

    this.collectibles = this.collectibles.filter((collectible) => {
      if (collectible.isCollected() || collectible.isOffscreen(balanceConfig.run.obstacleCleanupX)) {
        collectible.destroy();
        return false;
      }
      return true;
    });
  }

  private handleCollectible(collectible: Collectible, time: number): void {
    const { x, y } = collectible.hitbox;
    collectible.collect();

    if (collectible.type === 'energy-orb') {
      this.shardCombo = 0;
      this.pressure.add(-balanceConfig.pressure.energyOrbReduce);
      this.score.addEnergyOrb();
      SoundSystem.playEnergyOrb();
      this.emitCollectibleFeedback(x, y, '压力 -15', 0x65fff4);
      this.flashPressure(0x3cf7ff);
      return;
    }

    this.shardCombo += 1;
    this.comboResetAt = time + 1350;
    this.score.addInspirationShard();
    SoundSystem.playInspirationShard();
    this.emitCollectibleFeedback(
      x,
      y,
      this.shardCombo >= 3 ? `灵感连击 +${this.shardCombo}` : '灵感 +150',
      0x67eaff,
    );
  }

  private updateDashEvent(time: number): void {
    const aliveSeconds = this.score.getAliveSeconds();
    if (!this.dashActive && this.currentStage.id === 'energy-pipeline' && aliveSeconds >= this.nextDashAt) {
      this.startGooseDash(time);
    }

    if (!this.dashActive) {
      return;
    }

    if (time >= this.nextDashSegmentAt) {
      const dashSegment = this.spawner.update(0, this.speed, this.currentStage, this.countActiveDanger(), true);
      if (dashSegment) {
        this.spawnSegment(dashSegment);
      }
      this.nextDashSegmentAt = time + 1280;
    }

    if (time >= this.dashEndsAt) {
      this.dashActive = false;
      this.nextDashAt = aliveSeconds + Phaser.Math.Between(25, 30);
      if (this.dashHits === 0) {
        this.pressure.add(-balanceConfig.pressure.dashSurviveReduce);
        this.emitCenterNotice('冲刺段通过：压力 -15', 0x72fff2);
      } else {
        this.emitCenterNotice('G-00SE 暂时拉开距离', 0xffc2d0);
      }
    }
  }

  private startGooseDash(time: number): void {
    this.dashActive = true;
    this.dashEndsAt = time + 5000;
    this.nextDashSegmentAt = time + 280;
    this.dashHits = 0;
    SoundSystem.playDangerAlarm(1);
    this.cameras.main.shake(260, 0.006);
    this.emitCenterNotice('G-00SE 正在加速接近！', 0xff6b7a);
  }

  private completeRun(): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    SoundSystem.playSuccess();
    this.cameras.main.flash(520, 120, 245, 255, false);
    this.time.delayedCall(520, () => {
      this.scene.start('ResultScene', {
        outcome: 'success',
        score: this.score.getScore(),
        seconds: this.score.getAliveSeconds(),
        energyOrbs: this.score.getEnergyOrbs(),
        inspirationShards: this.score.getInspirationShards(),
      });
    });
  }

  private endRun(outcome: 'failure'): void {
    if (this.isGameOver) {
      return;
    }

    this.gooseAI?.catchPlayer(this.player.hitbox.x, this.player.hitbox.y);
    this.isGameOver = true;
    SoundSystem.playFailure();
    this.cameras.main.shake(260, 0.014);
    this.time.delayedCall(320, () => {
      this.scene.start('ResultScene', {
        outcome,
        score: this.score.getScore(),
        seconds: this.score.getAliveSeconds(),
        energyOrbs: this.score.getEnergyOrbs(),
        inspirationShards: this.score.getInspirationShards(),
      });
    });
  }

  private createKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }

    this.keys = keyboard.addKeys({
      jump1: Phaser.Input.Keyboard.KeyCodes.SPACE,
      jump2: Phaser.Input.Keyboard.KeyCodes.W,
      jump3: Phaser.Input.Keyboard.KeyCodes.UP,
      slide1: Phaser.Input.Keyboard.KeyCodes.S,
      slide2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      pause: Phaser.Input.Keyboard.KeyCodes.P,
    }) as KeyMap;
  }

  private updateHud(time: number): void {
    this.hud.update(
      {
        score: this.score.getScore(),
        time: this.score.getAliveSeconds(),
        stageName: this.currentStage.name,
        pressure: this.pressure.getValue(),
        shards: this.score.getInspirationShards(),
        dashActive: this.dashActive,
      },
    );
    void time;
  }

  private flashPressure(color = 0xff2e56): void {
    void color;
    this.hud.flash(color);
  }

  private cleanupDom(): void {
    this.hud?.destroy();
  }

  private cleanupScene(): void {
    this.gooseAI?.destroy();
    this.goose?.destroy();
    this.cleanupDom();
  }

  private getPressureValue(): number {
    return this.pressure?.getValue() ?? 0;
  }

  private emitCollectibleFeedback(x: number, y: number, text: string, color: number): void {
    const label = this.add
      .text(x, y - 34, text, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '18px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontStyle: 'bold',
        shadow: { color: '#06102a', blur: 8, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.tweens.add({
      targets: label,
      y: y - 72,
      alpha: 0,
      duration: 680,
      ease: 'Sine.easeOut',
      onComplete: () => label.destroy(),
    });

    for (let i = 0; i < 9; i += 1) {
      const spark = this.add.circle(x, y, Phaser.Math.Between(2, 5), color, 0.72).setDepth(28);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-38, 38),
        y: y + Phaser.Math.Between(-34, 34),
        alpha: 0,
        scale: 0.25,
        duration: 430,
        ease: 'Sine.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  private emitCenterNotice(text: string, color: number): void {
    const label = this.add
      .text(GAME_WIDTH / 2, 146, text, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '26px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontStyle: 'bold',
        shadow: { color: '#100415', blur: 14, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(36)
      .setAlpha(0);
    this.tweens.add({
      targets: label,
      alpha: 1,
      y: '-=12',
      duration: 180,
      yoyo: true,
      hold: 1050,
      onComplete: () => label.destroy(),
    });
  }

  private showStageBanner(stage: RunStageConfig): void {
    SoundSystem.playStageChange();
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, 132, 520, 76, 0x071024, 0.72)
      .setStrokeStyle(2, stage.palette.accent, 0.68)
      .setDepth(34)
      .setAlpha(0);
    const title = this.add
      .text(GAME_WIDTH / 2, 116, stage.name, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '27px',
        color: '#f1fdff',
        fontStyle: 'bold',
        shadow: { color: '#57eaff', blur: 12, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(35)
      .setAlpha(0);
    const subtitle = this.add
      .text(GAME_WIDTH / 2, 148, stage.subtitle, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '15px',
        color: '#bdefff',
      })
      .setOrigin(0.5)
      .setDepth(35)
      .setAlpha(0);

    this.tweens.add({
      targets: [panel, title, subtitle],
      alpha: 1,
      y: '-=8',
      duration: 260,
      ease: 'Sine.easeOut',
      yoyo: true,
      hold: 1180,
      onComplete: () => {
        panel.destroy();
        title.destroy();
        subtitle.destroy();
      },
    });
  }

  private updateDangerAlarm(time: number): void {
    const ratio = this.pressure.getRatio();
    if (ratio < 0.86 || time < this.nextDangerAlarmAt) {
      return;
    }

    SoundSystem.playDangerAlarm(ratio);
    this.nextDangerAlarmAt = time + Phaser.Math.Linear(1300, 720, Phaser.Math.Clamp((ratio - 0.86) / 0.14, 0, 1));
  }

  private createGroundCollider(): Phaser.GameObjects.Rectangle {
    const groundCollider = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 52, GAME_WIDTH, 104, 0, 0);
    this.physics.add.existing(groundCollider, true);
    return groundCollider;
  }

  private countActiveDanger(): number {
    return this.obstacles.filter((obstacle) => obstacle.hitbox.x > -20 && obstacle.hitbox.x < GAME_WIDTH + 120).length;
  }

  private updateDebugHitboxes(): void {
    if (!this.debugGraphics) {
      return;
    }

    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(2, 0x51ff7a, 0.9);
    this.drawBodyDebug(this.player.body);

    this.debugGraphics.lineStyle(2, 0xff5574, 0.88);
    for (const obstacle of this.obstacles) {
      this.drawBodyDebug(obstacle.body);
    }

    this.debugGraphics.lineStyle(2, 0xffe36a, 0.8);
    for (const collectible of this.collectibles) {
      this.drawBodyDebug(collectible.body);
    }
  }

  private drawBodyDebug(body: Phaser.Physics.Arcade.Body): void {
    this.debugGraphics?.strokeRect(body.x, body.y, body.width, body.height);
  }
}
