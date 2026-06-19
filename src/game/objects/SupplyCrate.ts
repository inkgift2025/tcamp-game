import Phaser from 'phaser';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;

export class SupplyCrate {
  readonly hitbox: Phaser.GameObjects.Zone;

  private readonly image: Phaser.GameObjects.Image;
  private opened = false;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, speed: number) {
    this.hitbox = scene.add.zone(x, y, 48, 44);
    scene.physics.add.existing(this.hitbox);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(48, 44, true);
    this.body.setVelocityX(-speed);
    this.image = scene.add.image(x, y, ASSET_KEYS.items.supplyCrate).setDepth(8).setDisplaySize(68, 62);
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  isOpened(): boolean {
    return this.opened;
  }

  open(): void {
    if (this.opened) {
      return;
    }
    this.opened = true;
    this.image.setTint(0x9fa7c4);
    this.image.setAlpha(0.62);
    for (let i = 0; i < 8; i += 1) {
      const spark = this.scene.add.circle(
        this.hitbox.x + Phaser.Math.Between(-20, 20),
        this.hitbox.y + Phaser.Math.Between(-18, 12),
        Phaser.Math.Between(2, 4),
        i % 2 ? 0x8ff7ff : 0xb76cff,
        0.7,
      );
      spark.setDepth(10);
      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-28, 28),
        y: spark.y - Phaser.Math.Between(18, 42),
        alpha: 0,
        duration: 420,
        ease: 'Sine.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
    this.scene.tweens.add({
      targets: this.image,
      y: '-=10',
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  update(speed: number, time: number): void {
    this.body.setVelocityX(-speed);
    this.image.setPosition(this.hitbox.x, this.hitbox.y + Math.sin(time / 210) * 1.5);
  }

  isOffscreen(cleanupX: number): boolean {
    return this.hitbox.x < cleanupX;
  }

  destroy(): void {
    this.image.destroy();
    this.hitbox.destroy();
  }
}
