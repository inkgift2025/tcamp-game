import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { theme } from '../config/visualTheme';
import { SoundSystem } from '../systems/SoundSystem';
import { createStartScreen } from '../../ui/startScreen';
import { UiOverlayHandle } from '../../ui/uiTypes';

export class StartScene extends Phaser.Scene {
  private startScreen?: UiOverlayHandle;

  constructor() {
    super('StartScene');
  }

  create(): void {
    this.drawTrainingCampBackdrop();
    this.createCanvasFallbackStart();
    this.startScreen = createStartScreen({
      onStart: () => this.startRun(),
    });
    this.input.keyboard?.once('keydown-SPACE', () => this.startRun());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyOverlay());
  }

  private startRun(): void {
    SoundSystem.unlock();
    SoundSystem.playStart();
    this.destroyOverlay();
    this.scene.start('RunScene');
  }

  private destroyOverlay(): void {
    this.startScreen?.destroy();
    this.startScreen = undefined;
  }

  private drawTrainingCampBackdrop(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x9adfff, 0x5aa6ff, 0x12376f, theme.nightBlue, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(theme.white, 0.12);
    bg.fillCircle(700, 118, 72);
    bg.lineStyle(2, theme.cyan, 0.22);
    bg.strokeCircle(700, 118, 98);

    for (let i = 0; i < 12; i += 1) {
      const x = 372 + i * 54;
      const height = 92 + (i % 5) * 28;
      bg.fillStyle(0x12376f, 0.28);
      bg.fillRoundedRect(x, GROUND_Y - height - 30, 38, height, 5);
      bg.lineStyle(1, i % 2 ? theme.mainBlue : theme.cyan, 0.16);
      bg.strokeRoundedRect(x, GROUND_Y - height - 30, 38, height, 5);
    }

    bg.fillStyle(0x0a2557, 1);
    bg.fillRect(0, GROUND_Y, GAME_WIDTH, 76);
    bg.lineStyle(5, theme.cyan, 0.72);
    bg.lineBetween(0, GROUND_Y, GAME_WIDTH, GROUND_Y);
  }

  private createCanvasFallbackStart(): void {
    this.add
      .text(GAME_WIDTH / 2, 130, '鹅影回廊', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '56px',
        color: '#f8fbff',
        fontStyle: 'bold',
        stroke: '#07143a',
        strokeThickness: 8,
        shadow: { color: '#4debff', blur: 18, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(4);

    this.add
      .text(GAME_WIDTH / 2, 188, 'Tcamp 逃亡测试', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '24px',
        color: '#d9f8ff',
        fontStyle: 'bold',
        stroke: '#07143a',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(4);

    const button = this.add
      .rectangle(GAME_WIDTH / 2, 278, 256, 72, 0x1d6bff, 0.92)
      .setStrokeStyle(3, theme.cyan, 0.96)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(GAME_WIDTH / 2, 278, '开始训练', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#07143a',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(5);

    button.on('pointerover', () => button.setFillStyle(0x4debff, 0.96));
    button.on('pointerout', () => button.setFillStyle(0x1d6bff, 0.92));
    button.on('pointerdown', () => this.startRun());
    label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.startRun());

    this.add
      .text(GAME_WIDTH / 2, 346, 'Space / W / ↑ 跳跃 · 空中再按二段跳 · S / ↓ 下蹲', {
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        fontSize: '17px',
        color: '#bdefff',
        fontStyle: 'bold',
        stroke: '#07143a',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(4);
  }
}
