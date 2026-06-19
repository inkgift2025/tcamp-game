import Phaser from 'phaser';
import { ASSET_KEYS } from '../systems/AssetKeys';

type ArcadeBody = Phaser.Physics.Arcade.Body;

export class DataPlatform {
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly sinking: boolean;

  private readonly image: Phaser.GameObjects.Image;
  private steppedAt: number | null = null;
  private gone = false;
  private shattered = false;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    speed: number,
    sinking = false,
  ) {
    this.sinking = sinking;
    this.hitbox = scene.add.zone(x, y, width, 26);
    scene.physics.add.existing(this.hitbox);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(width, 26, true);
    this.body.setVelocityX(-speed);

    this.image = scene.add
      .image(x, y, sinking ? ASSET_KEYS.platforms.sinkingPlatform : ASSET_KEYS.platforms.floatingPlatform)
      .setDepth(7)
      .setDisplaySize(width + 24, sinking ? 72 : 58);
  }

  get body(): ArcadeBody {
    return this.hitbox.body as ArcadeBody;
  }

  stepOn(time: number): void {
    if (this.sinking && this.steppedAt === null) {
      this.steppedAt = time;
    }
  }

  update(speed: number, time: number): void {
    this.body.setVelocityX(-speed);
    if (this.steppedAt !== null) {
      const elapsed = time - this.steppedAt;
      if (elapsed > 1200) {
        this.gone = true;
        this.body.enable = false;
        this.emitShatter();
      }
      this.image.setAlpha(elapsed > 800 ? (time % 130 < 65 ? 0.24 : 0.9) : 1);
      this.image.setTint(elapsed > 800 ? 0xffb06a : 0xffffff);
    }
    this.image.setPosition(this.hitbox.x, this.hitbox.y + 2);
  }

  isOffscreen(cleanupX: number): boolean {
    return this.hitbox.x < cleanupX || this.gone;
  }

  destroy(): void {
    this.image.destroy();
    this.hitbox.destroy();
  }

  private emitShatter(): void {
    if (this.shattered) {
      return;
    }
    this.shattered = true;
    for (let i = 0; i < 12; i += 1) {
      const chip = this.scene.add.rectangle(
        this.hitbox.x + Phaser.Math.Between(-this.hitbox.width / 2, this.hitbox.width / 2),
        this.hitbox.y,
        Phaser.Math.Between(3, 7),
        Phaser.Math.Between(3, 7),
        i % 2 ? 0xff8a3d : 0x65f4ff,
        0.75,
      );
      chip.setDepth(8);
      this.scene.tweens.add({
        targets: chip,
        x: chip.x + Phaser.Math.Between(-42, 42),
        y: chip.y + Phaser.Math.Between(-24, 30),
        alpha: 0,
        angle: Phaser.Math.Between(-120, 120),
        duration: 480,
        ease: 'Sine.easeOut',
        onComplete: () => chip.destroy(),
      });
    }
  }
}
