import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { theme } from '../config/visualTheme';
import { createResultScreen } from '../../ui/resultScreen';
import { UiOverlayHandle } from '../../ui/uiTypes';

interface ResultData {
  outcome?: 'failure' | 'success';
  score: number;
  seconds: number;
  energyOrbs?: number;
  inspirationShards?: number;
}

export class ResultScene extends Phaser.Scene {
  private resultScreen?: UiOverlayHandle;

  constructor() {
    super('ResultScene');
  }

  create(data: ResultData): void {
    const outcome = data.outcome ?? 'failure';
    const score = data.score ?? 0;
    const seconds = data.seconds ?? 0;
    const energyOrbs = data.energyOrbs ?? 0;
    const inspirationShards = data.inspirationShards ?? 0;
    const best = Math.max(score, Number(localStorage.getItem('goose-shadow-best') ?? 0));
    localStorage.setItem('goose-shadow-best', String(best));

    this.drawResultBackdrop(outcome);
    this.resultScreen = createResultScreen({
      outcome,
      score,
      seconds,
      best,
      energyOrbs,
      inspirationShards,
      onRestart: () => this.restartRun(),
    });

    this.input.keyboard?.once('keydown-R', () => this.restartRun());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyOverlay());
  }

  private restartRun(): void {
    this.destroyOverlay();
    this.scene.start('RunScene');
  }

  private destroyOverlay(): void {
    this.resultScreen?.destroy();
    this.resultScreen = undefined;
  }

  private drawResultBackdrop(outcome: 'failure' | 'success'): void {
    const bg = this.add.graphics();
    if (outcome === 'success') {
      bg.fillGradientStyle(0x8bdfff, 0x1d6bff, 0x11326a, theme.nightBlue, 1);
    } else {
      bg.fillGradientStyle(0x071126, 0x201045, 0x050712, 0x2d0a24, 1);
    }
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(outcome === 'success' ? theme.cyan : theme.dangerRed, 0.08);
    bg.fillCircle(690, 230, 220);
    bg.fillStyle(0x080d22, 0.58);
    bg.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    for (let i = 0; i < 9; i += 1) {
      const x = 70 + i * 104;
      const height = 94 + (i % 4) * 30;
      bg.fillStyle(0x071536, 0.34);
      bg.fillRoundedRect(x, GROUND_Y - height - 30, 52, height, 7);
      bg.lineStyle(1, outcome === 'success' ? theme.cyan : theme.dangerRed, 0.16);
      bg.strokeRoundedRect(x, GROUND_Y - height - 30, 52, height, 7);
    }

    bg.lineStyle(14, outcome === 'success' ? theme.cyan : theme.dangerRed, 0.2);
    bg.strokeRoundedRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32, 20);
  }
}
