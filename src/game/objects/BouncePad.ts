import Phaser from 'phaser';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;

export class BouncePad {
  readonly hitbox: Phaser.GameObjects.Zone;

  private readonly image: Phaser.GameObjects.Image;
  private readonly baseScaleX: number;
  private readonly baseScaleY: number;
  private squashUntil = 0;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, speed: number) {
    this.hitbox = scene.add.zone(x, y, 58, 24);
    scene.physics.add.existing(this.hitbox);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(58, 24, true);
    this.body.setVelocityX(-speed);
    this.image = scene.add.image(x, y - 6, ASSET_KEYS.items.bouncePad).setDepth(9).setDisplaySize(86, 54);
    this.baseScaleX = this.image.scaleX;
    this.baseScaleY = this.image.scaleY;
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  trigger(time: number): void {
    this.squashUntil = time + 220;
    const beam = this.scene.add.graphics().setPosition(this.hitbox.x, this.hitbox.y - 12).setDepth(10);
    beam.fillStyle(0x5df4ff, 0.28);
    beam.fillTriangle(-19, 0, 19, 0, 0, -118);
    beam.lineStyle(2, 0x8ffcff, 0.58);
    beam.lineBetween(0, 0, 0, -110);
    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      scaleY: 1.22,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => beam.destroy(),
    });
  }

  update(speed: number, time: number): void {
    this.body.setVelocityX(-speed);
    this.image.setPosition(this.hitbox.x, this.hitbox.y - 6);
    this.image.setScale(this.baseScaleX * 1.08, this.baseScaleY * (time < this.squashUntil ? 0.72 : 1));
  }

  isOffscreen(cleanupX: number): boolean {
    return this.hitbox.x < cleanupX;
  }

  destroy(): void {
    this.image.destroy();
    this.hitbox.destroy();
  }
}
