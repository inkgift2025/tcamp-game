import Phaser from 'phaser';
import { GAME_HEIGHT, GROUND_Y } from '../config/gameConfig';
import { ASSET_KEYS } from '../systems/AssetKeys';

export class GooseShadow {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly edgeWarning: Phaser.GameObjects.Graphics;
  private currentAnim = '';

  constructor(private readonly scene: Phaser.Scene) {
    this.sprite = scene.add
      .sprite(-230, GROUND_Y - 94, ASSET_KEYS.characters.gooseSpritesheet, 0)
      .setOrigin(0.5, 0.62)
      .setScale(0.42)
      .setDepth(2)
      .setAlpha(0.12);
    this.edgeWarning = scene.add.graphics().setDepth(20);
  }

  update(pressureRatio: number, playerX: number, time: number): void {
    const x = Phaser.Math.Linear(-260, playerX - 150, pressureRatio);
    const alpha = Phaser.Math.Linear(0.16, 0.78, pressureRatio);
    const scale = Phaser.Math.Linear(0.34, 0.5, pressureRatio);

    this.sprite.setPosition(x, GROUND_Y - 84);
    this.sprite.setAlpha(alpha);
    this.sprite.setScale(scale);
    this.sprite.setTint(pressureRatio > 0.82 && time % 180 < 90 ? 0xffc4cf : 0xffffff);

    if (pressureRatio > 0.9) {
      this.playVisual('goose_attack_shadow');
    } else if (pressureRatio > 0.74) {
      this.playVisual('goose_danger');
    } else if (pressureRatio > 0.48) {
      this.playVisual('goose_sprint');
    } else {
      this.playVisual('goose_run');
    }

    this.edgeWarning.clear();
    if (pressureRatio > 0.58) {
      const dangerAlpha = Phaser.Math.Clamp((pressureRatio - 0.58) / 0.42, 0, 1);
      const pulse = pressureRatio > 0.86 ? 0.45 + Math.sin(time / 70) * 0.2 : 0.32;
      this.edgeWarning.lineStyle(10 + dangerAlpha * 16, 0xff2947, dangerAlpha * pulse);
      this.edgeWarning.strokeRect(5, 5, 950, GAME_HEIGHT - 10);
    }
  }

  destroy(): void {
    this.sprite.destroy();
    this.edgeWarning.destroy();
  }

  private playVisual(key: string): void {
    if (this.currentAnim === key) {
      return;
    }
    this.currentAnim = key;
    this.sprite.play(key, true);
  }
}
