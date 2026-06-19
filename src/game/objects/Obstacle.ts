import Phaser from 'phaser';
import { ObstacleType } from '../config/balanceConfig';
import { GROUND_Y } from '../config/gameConfig';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;

export class Obstacle {
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly type: ObstacleType;
  passed = false;
  hasHit = false;

  private readonly image: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, type: ObstacleType, x: number, speed: number) {
    this.type = type;
    const width = type === 'data-barrier' ? 60 : type === 'data-crack' ? 112 : 96;
    const height = type === 'data-barrier' ? 70 : type === 'data-crack' ? 24 : 42;
    const y = type === 'data-barrier' ? GROUND_Y - height / 2 : type === 'data-crack' ? GROUND_Y - 12 : GROUND_Y - 88;

    this.hitbox = scene.add.zone(x, y, width, height);
    scene.physics.add.existing(this.hitbox);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(width, height, true);
    this.body.setVelocityX(-speed);

    this.image = scene.add
      .image(x, y + this.getVisualYOffset(), this.getTextureKey())
      .setDepth(8)
      .setDisplaySize(this.getDisplayWidth(), this.getDisplayHeight());
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  update(speed: number, time: number): void {
    this.body.setVelocityX(-speed);
    this.image.setPosition(this.hitbox.x, this.hitbox.y + this.getVisualYOffset());
    if (this.type === 'laser-gate' || this.type === 'data-crack') {
      this.image.setAlpha(0.84 + Math.sin(time / 60) * 0.14);
    }
  }

  isOffscreen(cleanupX: number): boolean {
    return this.hitbox.x < cleanupX;
  }

  destroy(): void {
    this.image.destroy();
    this.hitbox.destroy();
  }

  private getTextureKey(): string {
    if (this.type === 'laser-gate') {
      return ASSET_KEYS.obstacles.laserGate;
    }
    if (this.type === 'data-crack') {
      return ASSET_KEYS.obstacles.dataCrack;
    }
    return ASSET_KEYS.obstacles.dataBarrier;
  }

  private getDisplayWidth(): number {
    if (this.type === 'laser-gate') {
      return 118;
    }
    if (this.type === 'data-crack') {
      return 138;
    }
    return 82;
  }

  private getDisplayHeight(): number {
    if (this.type === 'laser-gate') {
      return 116;
    }
    if (this.type === 'data-crack') {
      return 70;
    }
    return 96;
  }

  private getVisualYOffset(): number {
    if (this.type === 'laser-gate') {
      return 0;
    }
    if (this.type === 'data-crack') {
      return -12;
    }
    return -8;
  }
}
