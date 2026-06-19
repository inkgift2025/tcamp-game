import Phaser from 'phaser';
import { ASSET_MANIFEST, ImageAssetDefinition } from '../config/assetManifest';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  private readonly failedKeys = new Set<string>();

  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.drawLoadingScreen();

    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failedKeys.add(file.key);
    });

    for (const asset of ASSET_MANIFEST) {
      if (asset.type === 'spritesheet') {
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth ?? 64,
          frameHeight: asset.frameHeight ?? 64,
        });
      } else {
        this.load.image(asset.key, asset.path);
      }
    }
  }

  create(): void {
    for (const asset of ASSET_MANIFEST) {
      if (this.failedKeys.has(asset.key) || !this.textures.exists(asset.key)) {
        this.createFallbackTexture(asset);
      }
    }

    this.createAnimations();
    this.scene.start('StartScene');
  }

  private drawLoadingScreen(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x07143a, 0x0d2f70, 0x081026, 0x111047, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 18, '素材管线启动中', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '30px',
        color: '#f8fbff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, '缺失图片会自动使用 placeholder 纹理', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '16px',
        color: '#bdefff',
      })
      .setOrigin(0.5);
  }

  private createFallbackTexture(asset: ImageAssetDefinition): void {
    if (this.textures.exists(asset.key)) {
      this.textures.remove(asset.key);
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.clear();

    switch (asset.kind) {
      case 'character':
        this.drawCharacterFallback(graphics, asset.key);
        graphics.generateTexture(asset.key, asset.frameWidth ?? 128, asset.frameHeight ?? 128);
        break;
      case 'background':
        this.drawBackgroundFallback(graphics);
        graphics.generateTexture(asset.key, 960, 540);
        break;
      case 'tile':
        this.drawTileFallback(graphics);
        graphics.generateTexture(asset.key, 192, 64);
        break;
      case 'obstacle':
        this.drawObstacleFallback(graphics);
        graphics.generateTexture(asset.key, 96, 128);
        break;
      case 'item':
        this.drawItemFallback(graphics);
        graphics.generateTexture(asset.key, 96, 96);
        break;
      case 'ui':
        this.drawUiFallback(graphics);
        graphics.generateTexture(asset.key, 220, 80);
        break;
    }

    graphics.destroy();
  }

  private drawCharacterFallback(graphics: Phaser.GameObjects.Graphics, key: string): void {
    // Placeholder only: keeps the game running until final character PNGs or spritesheets are imported.
    const isGoose = key.startsWith('goose');
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(64, 112, 76, 18);
    graphics.fillStyle(isGoose ? 0xf8fbff : 0x172b63, 1);
    graphics.fillEllipse(58, 66, isGoose ? 74 : 62, isGoose ? 88 : 78);
    graphics.fillStyle(isGoose ? 0xf8fbff : 0x101a42, 1);
    graphics.fillEllipse(76, 34, isGoose ? 46 : 48, isGoose ? 44 : 42);
    graphics.fillStyle(0xff9a3d, 1);
    graphics.fillTriangle(92, 34, 124, 44, 92, 54);
    graphics.fillStyle(isGoose ? 0xff4d6d : 0xf8fbff, 1);
    graphics.fillCircle(72, 26, 5);
    graphics.lineStyle(3, isGoose ? 0xff4d6d : 0x4debff, 0.75);
    graphics.strokeEllipse(58, 66, isGoose ? 82 : 70, isGoose ? 96 : 86);
  }

  private drawBackgroundFallback(graphics: Phaser.GameObjects.Graphics): void {
    // Placeholder only: replace with far/mid/near painted environment layers.
    graphics.fillGradientStyle(0x07143a, 0x1d6bff, 0x081026, 0x6c4dff, 1);
    graphics.fillRect(0, 0, 960, 540);
    graphics.fillStyle(0x4debff, 0.12);
    graphics.fillCircle(700, 132, 104);
    graphics.lineStyle(2, 0x4debff, 0.22);
    for (let y = 120; y < 400; y += 38) {
      graphics.lineBetween(0, y, 960, y - 24);
    }
  }

  private drawTileFallback(graphics: Phaser.GameObjects.Graphics): void {
    // Placeholder only: replace with platform and ground tile art.
    graphics.fillStyle(0x081434, 1);
    graphics.fillRoundedRect(0, 8, 192, 48, 8);
    graphics.lineStyle(4, 0x4debff, 0.9);
    graphics.strokeRoundedRect(2, 10, 188, 44, 8);
    graphics.fillStyle(0x4debff, 0.35);
    graphics.fillRoundedRect(28, 27, 136, 8, 4);
  }

  private drawObstacleFallback(graphics: Phaser.GameObjects.Graphics): void {
    // Placeholder only: replace with readable hazard art.
    graphics.fillStyle(0xff4d6d, 0.34);
    graphics.fillRoundedRect(18, 12, 60, 104, 10);
    graphics.lineStyle(4, 0xff9a3d, 0.92);
    graphics.strokeRoundedRect(18, 12, 60, 104, 10);
    graphics.lineStyle(3, 0xf8fbff, 0.7);
    graphics.lineBetween(32, 36, 64, 92);
    graphics.lineBetween(64, 36, 32, 92);
  }

  private drawItemFallback(graphics: Phaser.GameObjects.Graphics): void {
    // Placeholder only: replace with collectable item art.
    graphics.fillStyle(0x4debff, 0.28);
    graphics.fillCircle(48, 48, 36);
    graphics.fillStyle(0xf8fbff, 0.92);
    graphics.fillCircle(48, 48, 18);
    graphics.lineStyle(3, 0x1d6bff, 0.8);
    graphics.strokeCircle(48, 48, 32);
  }

  private drawUiFallback(graphics: Phaser.GameObjects.Graphics): void {
    // Placeholder only: CSS owns advanced UI; this texture is for future Phaser-side lightweight use.
    graphics.fillStyle(0x07143a, 0.82);
    graphics.fillRoundedRect(0, 0, 220, 80, 12);
    graphics.lineStyle(3, 0x4debff, 0.72);
    graphics.strokeRoundedRect(2, 2, 216, 76, 12);
    graphics.fillStyle(0xf8fbff, 0.08);
    graphics.fillRoundedRect(16, 16, 188, 18, 8);
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'penguin_idle',
      frames: [{ key: 'penguin_spritesheet', frame: 0 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'penguin_run',
      frames: this.anims.generateFrameNumbers('penguin_spritesheet', { frames: [1, 2] }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: 'penguin_jump',
      frames: [{ key: 'penguin_spritesheet', frame: 3 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'penguin_double_jump',
      frames: [{ key: 'penguin_spritesheet', frame: 4 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'penguin_crouch',
      frames: [{ key: 'penguin_spritesheet', frame: 5 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'penguin_hurt',
      frames: [{ key: 'penguin_spritesheet', frame: 6 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'goose_run',
      frames: this.anims.generateFrameNumbers('goose_spritesheet', { frames: [0, 1] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'goose_sprint',
      frames: this.anims.generateFrameNumbers('goose_spritesheet', { frames: [1, 2] }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'goose_danger',
      frames: [{ key: 'goose_spritesheet', frame: 3 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'goose_attack_shadow',
      frames: [{ key: 'goose_spritesheet', frame: 4 }],
      frameRate: 1,
    });
  }
}
