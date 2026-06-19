import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { RunStageConfig } from '../config/stageConfig';
import { ASSET_KEYS } from './AssetKeys';

interface StageBackgroundKeys {
  far: string;
  mid: string;
  near: string;
}

export class BackgroundSystem {
  private readonly far: Phaser.GameObjects.TileSprite;
  private readonly middle: Phaser.GameObjects.TileSprite;
  private readonly foreground: Phaser.GameObjects.TileSprite;
  private readonly ground: Phaser.GameObjects.TileSprite;
  private readonly speedLines: Phaser.GameObjects.Graphics;
  private stage: RunStageConfig;

  constructor(private readonly scene: Phaser.Scene, initialStage: RunStageConfig) {
    this.stage = initialStage;
    const keys = this.getStageBackgroundKeys(initialStage);
    this.far = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, keys.far).setOrigin(0).setDepth(0);
    this.middle = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, keys.mid).setOrigin(0).setDepth(1).setAlpha(0.9);
    this.foreground = scene.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, keys.near)
      .setOrigin(0)
      .setDepth(2)
      .setAlpha(0.9);
    this.ground = scene.add
      .tileSprite(0, GROUND_Y - 8, GAME_WIDTH, 104, ASSET_KEYS.platforms.groundTile)
      .setOrigin(0, 0)
      .setDepth(3);
    this.speedLines = scene.add.graphics().setDepth(4);
  }

  setStage(stage: RunStageConfig): void {
    this.stage = stage;
    const keys = this.getStageBackgroundKeys(stage);
    this.far.setTexture(keys.far);
    this.middle.setTexture(keys.mid);
    this.foreground.setTexture(keys.near);
  }

  update(time: number, pressureRatio: number, dashActive: boolean): void {
    const stageSpeed = this.stage.speedGainMultiplier;
    this.far.tilePositionX = time * 0.012 * stageSpeed;
    this.middle.tilePositionX = time * 0.045 * stageSpeed;
    this.foreground.tilePositionX = time * 0.09 * stageSpeed;
    this.ground.tilePositionX = time * 0.13 * stageSpeed;
    this.drawSpeedLines(time, pressureRatio, dashActive);
  }

  destroy(): void {
    this.far.destroy();
    this.middle.destroy();
    this.foreground.destroy();
    this.ground.destroy();
    this.speedLines.destroy();
  }

  private getStageBackgroundKeys(stage: RunStageConfig): StageBackgroundKeys {
    if (stage.id === 'data-corridor') {
      return {
        far: ASSET_KEYS.backgrounds.dataCorridorFar,
        mid: ASSET_KEYS.backgrounds.dataCorridorMid,
        near: ASSET_KEYS.backgrounds.dataCorridorNear,
      };
    }
    if (stage.id === 'energy-pipeline') {
      return {
        far: ASSET_KEYS.backgrounds.energyPipelineFar,
        mid: ASSET_KEYS.backgrounds.energyPipelineMid,
        near: ASSET_KEYS.backgrounds.energyPipelineNear,
      };
    }
    return {
      far: ASSET_KEYS.backgrounds.launchHallFar,
      mid: ASSET_KEYS.backgrounds.launchHallMid,
      near: ASSET_KEYS.backgrounds.launchHallNear,
    };
  }

  private drawSpeedLines(time: number, pressureRatio: number, dashActive: boolean): void {
    const { palette } = this.stage;
    this.speedLines.clear();
    const density = Math.floor(12 * this.stage.lineDensity);
    for (let i = 0; i < density; i += 1) {
      const offset = (time * (0.1 + pressureRatio * 0.1 + (dashActive ? 0.12 : 0)) + i * 118) % (GAME_WIDTH + 260);
      const x = GAME_WIDTH - offset;
      const y = 120 + ((i * 43) % 230);
      const color = i % 5 === 0 ? palette.warning : i % 2 ? palette.secondary : palette.accent;
      this.speedLines.lineStyle(1, color, 0.1 + pressureRatio * 0.12);
      this.speedLines.lineBetween(x, y, x + 138 + pressureRatio * 90, y - 14);
    }
  }
}
