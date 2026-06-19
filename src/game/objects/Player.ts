import Phaser from 'phaser';
import { GROUND_Y } from '../config/gameConfig';
import { balanceConfig } from '../config/balanceConfig';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;
export type PlayerAction = 'idle' | 'run' | 'jump' | 'double_jump' | 'crouch' | 'hurt';

export class Player {
  readonly hitbox: Phaser.GameObjects.Zone;
  currentAction: PlayerAction = 'idle';

  private readonly trail: Phaser.GameObjects.Graphics;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly visual: Phaser.GameObjects.Container;
  private readonly maxJumps = 2;
  private jumpsUsed = 0;
  private wasGrounded = false;
  private isSliding = false;
  private invulnerableUntil = 0;
  private currentAnim = '';

  constructor(private readonly scene: Phaser.Scene) {
    this.hitbox = scene.add.zone(
      balanceConfig.player.x,
      balanceConfig.player.startY,
      balanceConfig.player.width,
      balanceConfig.player.height,
    );
    scene.physics.add.existing(this.hitbox);

    const body = this.body;
    body.setSize(balanceConfig.player.width, balanceConfig.player.height, true);
    body.setCollideWorldBounds(true);
    body.setDragX(0);
    body.setMaxVelocity(0, 880);

    this.trail = scene.add.graphics();
    this.sprite = scene.add
      .sprite(0, 0, ASSET_KEYS.characters.penguinSpritesheet, 0)
      .setOrigin(0.5, 0.62)
      .setScale(0.34);
    this.visual = scene.add.container(this.hitbox.x, this.hitbox.y, [this.trail, this.sprite]);
    this.visual.setDepth(12);
    this.playVisual('penguin_idle');
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  isInvulnerable(time: number): boolean {
    return time < this.invulnerableUntil;
  }

  canJump(): boolean {
    if (this.isSliding) {
      return false;
    }
    return this.body.blocked.down || this.jumpsUsed < this.maxJumps;
  }

  resetJumps(): void {
    this.jumpsUsed = 0;
  }

  jump(): boolean {
    if (!this.canJump()) {
      return false;
    }

    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) {
      this.jumpsUsed = 1;
      this.body.setVelocityY(balanceConfig.player.jumpVelocity);
      this.currentAction = 'jump';
      this.emitJumpTrail(0x52f3ff, 10);
      return true;
    }

    if (this.jumpsUsed === 0) {
      this.jumpsUsed = 1;
    }
    this.jumpsUsed += 1;
    this.body.setVelocityY(balanceConfig.player.doubleJumpVelocity);
    this.currentAction = 'double_jump';
    this.emitJumpTrail(0x7df7ff, 14);
    this.emitDoubleJumpRing();
    return true;
  }

  startSlide(): boolean {
    // TODO: 将 slide 改为 hold-to-crouch，按住 S / ↓ 持续下蹲，松开恢复站立，并同步调整 hitbox。
    if (!this.body.blocked.down || this.isSliding) {
      return false;
    }

    this.isSliding = true;
    this.hitbox.setSize(balanceConfig.player.width + 18, balanceConfig.player.slideHeight);
    this.body.setSize(balanceConfig.player.width + 18, balanceConfig.player.slideHeight, true);
    this.hitbox.y = GROUND_Y - balanceConfig.player.slideHeight / 2;
    this.currentAction = 'crouch';
    this.playVisual('penguin_crouch');

    return true;
  }

  stopSlide(): void {
    if (!this.isSliding) {
      return;
    }

    this.isSliding = false;
    this.hitbox.setSize(balanceConfig.player.width, balanceConfig.player.height);
    this.body.setSize(balanceConfig.player.width, balanceConfig.player.height, true);
    if (this.body.blocked.down) {
      this.hitbox.y = GROUND_Y - balanceConfig.player.height / 2;
    }
    this.currentAction = 'run';
    this.playVisual('penguin_run');
  }

  bounce(): void {
    this.isSliding = false;
    this.hitbox.setSize(balanceConfig.player.width, balanceConfig.player.height);
    this.body.setSize(balanceConfig.player.width, balanceConfig.player.height, true);
    this.body.setVelocityY(balanceConfig.player.bounceVelocity);
    this.jumpsUsed = 1;
    this.currentAction = 'jump';
    this.emitJumpTrail(0x68f7ff, 18);
    this.emitDoubleJumpRing(0x5df4ff, 1.25);
  }

  hit(time: number): void {
    this.invulnerableUntil = time + balanceConfig.player.invulnerableMs;
    this.currentAction = 'hurt';
    this.scene.tweens.add({
      targets: this.visual,
      alpha: 0.22,
      duration: 65,
      yoyo: true,
      repeat: 7,
      onComplete: () => this.visual.setAlpha(1),
    });

    for (let i = 0; i < 4; i += 1) {
      const glyph = this.scene.add
        .text(
          this.hitbox.x + Phaser.Math.Between(-24, 34),
          this.hitbox.y - Phaser.Math.Between(42, 78),
          i % 2 ? 'ERR' : '!',
          {
            fontFamily: 'Arial, Microsoft YaHei, sans-serif',
            fontSize: i % 2 ? '12px' : '18px',
            color: '#ff496a',
            fontStyle: 'bold',
            stroke: '#19020a',
            strokeThickness: 3,
          },
        )
        .setOrigin(0.5)
        .setDepth(34);
      this.scene.tweens.add({
        targets: glyph,
        y: glyph.y - 24,
        alpha: 0,
        duration: 520,
        ease: 'Sine.easeOut',
        onComplete: () => glyph.destroy(),
      });
    }
  }

  update(time: number): void {
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded && !this.wasGrounded) {
      this.resetJumps();
      this.emitLandingDust();
    }
    this.wasGrounded = grounded;

    const bob = grounded && !this.isSliding ? Math.sin(time / 92) * 3 : 0;
    this.visual.setPosition(this.hitbox.x, this.hitbox.y + bob);
    this.visual.setRotation(this.isSliding ? -0.04 : Phaser.Math.Clamp(this.body.velocity.y / 2300, -0.18, 0.18));
    this.updateVisualState(time, grounded);

    this.trail.clear();
    if (!grounded && this.body.velocity.y < 120) {
      this.trail.fillStyle(0x42e8ff, 0.2);
      this.trail.fillEllipse(-42, 29, 70, 17);
      this.trail.fillStyle(0x8b5cff, 0.15);
      this.trail.fillEllipse(-56, 36, 48, 10);
    }
  }

  destroy(): void {
    this.visual.destroy();
    this.hitbox.destroy();
  }

  private updateVisualState(time: number, grounded: boolean): void {
    if (this.isInvulnerable(time)) {
      this.currentAction = 'hurt';
      this.playVisual('penguin_hurt');
      return;
    }
    if (this.isSliding) {
      this.currentAction = 'crouch';
      this.playVisual('penguin_crouch');
      return;
    }
    if (!grounded) {
      this.currentAction = this.jumpsUsed >= 2 ? 'double_jump' : 'jump';
      this.playVisual(this.jumpsUsed >= 2 ? 'penguin_double_jump' : 'penguin_jump');
      return;
    }
    this.currentAction = 'run';
    this.playVisual('penguin_run');
  }

  private playVisual(key: string): void {
    if (this.currentAnim === key) {
      return;
    }
    this.currentAnim = key;
    this.sprite.play(key, true);
  }

  private emitJumpTrail(color = 0x52f3ff, count = 7): void {
    for (let i = 0; i < count; i += 1) {
      const particle = this.scene.add.circle(
        this.hitbox.x - 22 + Phaser.Math.Between(-12, 16),
        this.hitbox.y + 45 + Phaser.Math.Between(-6, 10),
        Phaser.Math.Between(2, 5),
        color,
        0.58,
      );
      particle.setDepth(9);
      this.scene.tweens.add({
        targets: particle,
        x: particle.x - Phaser.Math.Between(28, 64),
        y: particle.y + Phaser.Math.Between(6, 24),
        alpha: 0,
        scale: 0.3,
        duration: 360,
        ease: 'Sine.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private emitDoubleJumpRing(color = 0x78f7ff, scale = 1): void {
    const ring = this.scene.add.graphics().setPosition(this.hitbox.x, this.hitbox.y + 20).setDepth(11);
    ring.lineStyle(3, color, 0.9);
    ring.strokeEllipse(0, 0, 66, 18);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 1.8 * scale,
      scaleY: 1.8 * scale,
      alpha: 0,
      duration: 430,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private emitLandingDust(): void {
    for (let i = 0; i < 6; i += 1) {
      const dust = this.scene.add.circle(
        this.hitbox.x + Phaser.Math.Between(-28, 28),
        GROUND_Y - 6,
        Phaser.Math.Between(2, 4),
        i % 2 ? 0x82f4ff : 0xb8a4ff,
        0.38,
      );
      dust.setDepth(8);
      this.scene.tweens.add({
        targets: dust,
        x: dust.x + Phaser.Math.Between(-28, 28),
        y: dust.y - Phaser.Math.Between(8, 18),
        alpha: 0,
        duration: 280,
        ease: 'Sine.easeOut',
        onComplete: () => dust.destroy(),
      });
    }
  }
}
