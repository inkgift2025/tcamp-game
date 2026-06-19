import Phaser from 'phaser';
import { CollectibleType } from '../config/balanceConfig';
import { GROUND_Y } from '../config/gameConfig';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;

export class Collectible {
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly type: CollectibleType;

  private readonly image: Phaser.GameObjects.Image;
  private readonly baseScaleX: number;
  private readonly baseScaleY: number;
  private readonly baseY: number;
  private collected = false;

  constructor(scene: Phaser.Scene, type: CollectibleType, x: number, speed: number, y?: number) {
    this.type = type;
    this.baseY = y ?? (type === 'energy-orb' ? GROUND_Y - 112 : GROUND_Y - 166);

    this.hitbox = scene.add.zone(x, this.baseY, 42, 42);
    scene.physics.add.existing(this.hitbox);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setCircle(21);
    this.body.setVelocityX(-speed);

    this.image = scene.add
      .image(x, this.baseY, type === 'energy-orb' ? ASSET_KEYS.items.energyOrb : ASSET_KEYS.items.inspirationShard)
      .setDepth(9)
      .setDisplaySize(type === 'energy-orb' ? 58 : 46, type === 'energy-orb' ? 58 : 62);
    this.baseScaleX = this.image.scaleX;
    this.baseScaleY = this.image.scaleY;
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  update(speed: number, time: number): void {
    this.body.setVelocityX(-speed);
    const hover = Math.sin(time / 180 + this.hitbox.x / 80) * 7;
    const pulse = 1 + Math.sin(time / 130) * 0.045;
    this.hitbox.y = this.baseY + hover;
    this.image.setPosition(this.hitbox.x, this.hitbox.y);
    this.image.setScale(this.baseScaleX * pulse, this.baseScaleY * pulse);
    this.image.setAngle(this.type === 'energy-orb' ? Math.sin(time / 240) * 6 : time / 22);
  }

  isOffscreen(cleanupX: number): boolean {
    return this.hitbox.x < cleanupX;
  }

  collect(): void {
    this.collected = true;
    this.hitbox.disableInteractive();
    this.body.enable = false;
    this.image.setVisible(false);
  }

  isCollected(): boolean {
    return this.collected;
  }

  destroy(): void {
    this.image.destroy();
    this.hitbox.destroy();
  }
}
