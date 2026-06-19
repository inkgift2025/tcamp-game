import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { ASSET_KEYS } from '../systems/AssetKeys';
import type { PlayerAction } from './Player';

export type GooseAIState = 'run' | 'jump' | 'double_jump' | 'sprint' | 'crouch_chase' | 'low_fly' | 'danger' | 'catch_player';

export interface GooseAIUpdateState {
  playerX: number;
  playerY: number;
  playerAction: PlayerAction;
  pressureValue: number;
  isGameOver: boolean;
}

const PRESSURE_DISTANCE_POINTS = [
  { pressure: 0, offset: -180, alpha: 0.55 },
  { pressure: 30, offset: -140, alpha: 0.7 },
  { pressure: 60, offset: -95, alpha: 0.9 },
  { pressure: 85, offset: -55, alpha: 1 },
  { pressure: 100, offset: -14, alpha: 1 },
];

export class GooseAI {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly speedLines: Phaser.GameObjects.Graphics;
  private readonly chaseTrail: Phaser.GameObjects.Graphics;
  private readonly edgeWarning: Phaser.GameObjects.Graphics;
  private currentAnim = '';
  private state: GooseAIState = 'run';

  constructor(private readonly scene: Phaser.Scene) {
    this.chaseTrail = scene.add.graphics().setDepth(5);
    this.speedLines = scene.add.graphics().setDepth(6);
    this.sprite = scene.add
      .sprite(65, GROUND_Y - 82, ASSET_KEYS.characters.gooseSpritesheet, 0)
      .setOrigin(0.5, 0.62)
      .setScale(0.34)
      .setDepth(6)
      .setAlpha(0.55);
    this.edgeWarning = scene.add.graphics().setDepth(19);
    this.playVisual('goose_run');
  }

  update(delta: number, state: GooseAIUpdateState): void {
    const pressureValue = Phaser.Math.Clamp(state.pressureValue, 0, 100);

    const gooseState = this.resolveState(state.playerAction, pressureValue, state.isGameOver);
    this.state = gooseState;

    const target = this.resolveTarget(state.playerX, state.playerY, pressureValue, gooseState);
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, target.x, 0.08);
    this.sprite.y = Phaser.Math.Linear(this.sprite.y, target.y, 0.08);
    this.sprite.setAlpha(target.alpha);
    this.sprite.setScale(target.scale);
    this.sprite.setTint(pressureValue >= 85 || gooseState === 'danger' || gooseState === 'catch_player' ? 0xffb6c6 : 0xffffff);

    const time = this.scene.time.now;
    const bob = this.getBob(time, gooseState);
    this.sprite.y += bob;
    this.sprite.setRotation(this.getRotation(gooseState));
    this.playVisual(this.getAnimationKey(gooseState, pressureValue));

    this.drawChaseTrail(state.playerX, state.playerY, pressureValue, gooseState);
    this.drawSpeedLines(time, pressureValue, gooseState);
    this.drawEdgeWarning(time, pressureValue);

    void delta;
  }

  catchPlayer(playerX: number, playerY: number): void {
    this.state = 'catch_player';
    this.sprite.setPosition(Phaser.Math.Linear(this.sprite.x, playerX - 10, 0.45), Phaser.Math.Linear(this.sprite.y, playerY, 0.35));
    this.sprite.setAlpha(1);
    this.sprite.setScale(0.52);
    this.sprite.setTint(0xff6b7f);
    this.playVisual('goose_attack_shadow');
  }

  destroy(): void {
    this.chaseTrail.destroy();
    this.speedLines.destroy();
    this.edgeWarning.destroy();
    this.sprite.destroy();
  }

  private resolveState(playerAction: PlayerAction, pressureValue: number, isGameOver: boolean): GooseAIState {
    if (pressureValue >= 100 || isGameOver) {
      return 'catch_player';
    }
    if (playerAction === 'hurt' || pressureValue >= 85) {
      return 'danger';
    }
    if (playerAction === 'double_jump') {
      return 'sprint';
    }
    if (playerAction === 'jump') {
      return 'jump';
    }
    if (playerAction === 'crouch') {
      return 'low_fly';
    }
    return 'run';
  }

  private resolveTarget(playerX: number, playerY: number, pressureValue: number, gooseState: GooseAIState): { x: number; y: number; alpha: number; scale: number } {
    const offset = this.interpolatePressureValue(pressureValue, 'offset');
    const alpha = this.interpolatePressureValue(pressureValue, 'alpha');
    const pressureRatio = pressureValue / 100;
    let actionOffsetX = 0;
    let targetY = GROUND_Y - 82;

    if (gooseState === 'jump') {
      targetY = Math.min(GROUND_Y - 96, playerY + 22);
    } else if (gooseState === 'sprint' || gooseState === 'double_jump') {
      targetY = Math.min(GROUND_Y - 116, playerY + 10);
      actionOffsetX = 16;
    } else if (gooseState === 'low_fly' || gooseState === 'crouch_chase') {
      targetY = GROUND_Y - 48;
      actionOffsetX = 10;
    } else if (gooseState === 'danger') {
      targetY = Math.min(GROUND_Y - 84, playerY + 10);
      actionOffsetX = 12;
    } else if (gooseState === 'catch_player') {
      targetY = playerY;
      actionOffsetX = 14;
    }

    return {
      x: playerX + offset + actionOffsetX,
      y: targetY,
      alpha,
      scale: Phaser.Math.Linear(0.34, 0.5, pressureRatio),
    };
  }

  private interpolatePressureValue(pressureValue: number, key: 'offset' | 'alpha'): number {
    for (let i = 0; i < PRESSURE_DISTANCE_POINTS.length - 1; i += 1) {
      const current = PRESSURE_DISTANCE_POINTS[i];
      const next = PRESSURE_DISTANCE_POINTS[i + 1];
      if (pressureValue <= next.pressure) {
        const ratio = Phaser.Math.Clamp((pressureValue - current.pressure) / (next.pressure - current.pressure), 0, 1);
        return Phaser.Math.Linear(current[key], next[key], ratio);
      }
    }
    return PRESSURE_DISTANCE_POINTS[PRESSURE_DISTANCE_POINTS.length - 1][key];
  }

  private getAnimationKey(state: GooseAIState, pressureValue: number): string {
    if (state === 'catch_player') {
      return 'goose_attack_shadow';
    }
    if (state === 'danger' || pressureValue >= 85) {
      return 'goose_danger';
    }
    if (state === 'sprint' || state === 'double_jump' || state === 'low_fly' || state === 'crouch_chase') {
      return 'goose_sprint';
    }
    return 'goose_run';
  }

  private getBob(time: number, state: GooseAIState): number {
    if (state === 'low_fly' || state === 'crouch_chase') {
      return Math.sin(time / 54) * 1.5;
    }
    if (state === 'sprint' || state === 'danger') {
      return Math.sin(time / 48) * 4;
    }
    return Math.sin(time / 86) * 3;
  }

  private getRotation(state: GooseAIState): number {
    if (state === 'low_fly' || state === 'crouch_chase') {
      return -0.08;
    }
    if (state === 'sprint' || state === 'double_jump') {
      return -0.16;
    }
    if (state === 'catch_player') {
      return -0.2;
    }
    return -0.03;
  }

  private drawChaseTrail(playerX: number, playerY: number, pressureValue: number, state: GooseAIState): void {
    this.chaseTrail.clear();
    const pressureRatio = pressureValue / 100;
    const alpha = Phaser.Math.Clamp(0.16 + pressureRatio * 0.28, 0.14, 0.44);
    const color = pressureValue >= 70 ? 0xff3c6a : 0x7deeff;
    const y = state === 'low_fly' ? GROUND_Y - 42 : Phaser.Math.Linear(this.sprite.y + 18, playerY + 36, 0.25);
    this.chaseTrail.lineStyle(2 + pressureRatio * 2, color, alpha);
    this.chaseTrail.beginPath();
    this.chaseTrail.moveTo(this.sprite.x + 18, y);
    this.chaseTrail.lineTo(Phaser.Math.Linear(this.sprite.x, playerX, 0.5), y + 8);
    this.chaseTrail.lineTo(playerX - 30, playerY + 46);
    this.chaseTrail.strokePath();
  }

  private drawSpeedLines(time: number, pressureValue: number, state: GooseAIState): void {
    this.speedLines.clear();
    if (pressureValue < 45 && state !== 'sprint' && state !== 'low_fly') {
      return;
    }

    const pressureRatio = pressureValue / 100;
    const lineCount = pressureValue >= 70 || state === 'sprint' ? 7 : 4;
    const color = pressureValue >= 70 ? 0xff315d : 0x9f6bff;
    for (let i = 0; i < lineCount; i += 1) {
      const phase = (time * 0.42 + i * 31) % 130;
      const x = this.sprite.x - 78 - phase * 0.34;
      const y = this.sprite.y - 34 + i * 14;
      this.speedLines.lineStyle(2, color, 0.18 + pressureRatio * 0.32);
      this.speedLines.lineBetween(x, y, x - 42 - pressureRatio * 38, y + 9);
    }
  }

  private drawEdgeWarning(time: number, pressureValue: number): void {
    this.edgeWarning.clear();
    if (pressureValue < 70) {
      return;
    }

    const dangerRatio = Phaser.Math.Clamp((pressureValue - 70) / 30, 0, 1);
    const pulse = 0.28 + Math.sin(time / 82) * 0.12;
    this.edgeWarning.lineStyle(8 + dangerRatio * 12, 0xff2947, dangerRatio * pulse);
    this.edgeWarning.strokeRect(6, 6, GAME_WIDTH - 12, GAME_HEIGHT - 12);
  }

  private playVisual(key: string): void {
    if (this.currentAnim === key) {
      return;
    }
    this.currentAnim = key;
    this.sprite.play(key, true);
  }
}
