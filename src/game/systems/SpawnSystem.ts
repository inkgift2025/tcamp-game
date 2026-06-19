import Phaser from 'phaser';
import { GAME_WIDTH, GROUND_Y } from '../config/gameConfig';
import { balanceConfig, CollectibleType, ObstacleType } from '../config/balanceConfig';
import { RunStageConfig } from '../config/stageConfig';

export type SegmentKind =
  | 'simple-obstacle'
  | 'shard-line'
  | 'shard-arc'
  | 'platform-reward'
  | 'bounce-route'
  | 'laser-rhythm'
  | 'supply-crate'
  | 'goose-dash';

export interface SegmentPlan {
  kind: SegmentKind;
  x: number;
  obstacles: Array<{ type: ObstacleType; xOffset: number }>;
  collectibles: Array<{ type: CollectibleType; xOffset: number; y: number }>;
  platforms: Array<{ xOffset: number; y: number; width: number; sinking?: boolean }>;
  bouncePads: Array<{ xOffset: number; y: number }>;
  crates: Array<{ xOffset: number; y: number }>;
}

export class SpawnSystem {
  private elapsedSinceSegment = 0;
  private nextSegmentSpawnMs = 900;
  private lastKind: SegmentKind | null = null;

  constructor(private readonly scene: Phaser.Scene) {}

  reset(): void {
    this.elapsedSinceSegment = 0;
    this.nextSegmentSpawnMs = 900;
    this.lastKind = null;
  }

  update(
    deltaMs: number,
    speed: number,
    stage: RunStageConfig,
    activeDangerCount: number,
    forceDash = false,
  ): SegmentPlan | null {
    this.elapsedSinceSegment += deltaMs;
    if (!forceDash && this.elapsedSinceSegment < this.nextSegmentSpawnMs) {
      return null;
    }

    this.elapsedSinceSegment = 0;
    const gapPx = Phaser.Math.Between(balanceConfig.run.segmentMinGapPx, balanceConfig.run.segmentMaxGapPx);
    this.nextSegmentSpawnMs = (gapPx / speed) * 1000 * stage.obstacleIntervalMultiplier;
    const kind = forceDash ? 'goose-dash' : this.pickSegment(stage, activeDangerCount);
    this.lastKind = kind;
    return this.buildSegment(kind);
  }

  getSpawnX(): number {
    return GAME_WIDTH + 80 + Phaser.Math.Between(0, 80);
  }

  private pickSegment(stage: RunStageConfig, activeDangerCount: number): SegmentKind {
    const aliveSeconds = Number(this.scene.registry.get('runTimeSeconds') ?? 0);
    if (aliveSeconds < 10) {
      return Math.random() > 0.3 ? 'shard-line' : 'simple-obstacle';
    }
    if (aliveSeconds < 20) {
      return Phaser.Math.RND.pick(['shard-line', 'shard-arc', 'shard-line', 'simple-obstacle']);
    }

    const pool: SegmentKind[] =
      stage.id === 'launch-hall'
        ? ['simple-obstacle', 'shard-line', 'shard-arc', 'supply-crate']
        : stage.id === 'data-corridor'
          ? ['simple-obstacle', 'shard-arc', 'platform-reward', 'bounce-route', 'supply-crate']
          : ['simple-obstacle', 'shard-arc', 'platform-reward', 'bounce-route', 'laser-rhythm', 'supply-crate'];

    let kind = Phaser.Math.RND.pick(pool);
    if (activeDangerCount >= balanceConfig.run.maxActiveObstacles && (kind === 'simple-obstacle' || kind === 'laser-rhythm')) {
      kind = Phaser.Math.RND.pick(['shard-line', 'shard-arc', 'platform-reward', 'supply-crate']);
    }
    if (kind === this.lastKind && Math.random() > 0.35) {
      kind = Phaser.Math.RND.pick(pool);
    }
    return kind;
  }

  private buildSegment(kind: SegmentKind): SegmentPlan {
    const x = this.getSpawnX();
    const segment: SegmentPlan = {
      kind,
      x,
      obstacles: [],
      collectibles: [],
      platforms: [],
      bouncePads: [],
      crates: [],
    };

    if (kind === 'simple-obstacle') {
      const aliveSeconds = Number(this.scene.registry.get('runTimeSeconds') ?? 0);
      if (aliveSeconds < 20) {
        segment.obstacles.push({ type: 'data-barrier', xOffset: 0 });
        this.addShardLine(segment, 120, GROUND_Y - 112, 4, 48);
        return segment;
      }
      const roll = Math.random();
      const type: ObstacleType = roll < 0.18 ? 'data-crack' : roll < 0.42 ? 'laser-gate' : 'data-barrier';
      segment.obstacles.push({ type, xOffset: 0 });
      this.addShardLine(segment, 120, GROUND_Y - 112, 4, 48);
      return segment;
    }

    if (kind === 'shard-line') {
      this.addShardLine(segment, 0, GROUND_Y - 108, Phaser.Math.Between(3, 6), 46);
      return segment;
    }

    if (kind === 'shard-arc') {
      this.addShardArc(segment, 0, GROUND_Y - 106, 6, 54, 72);
      if (Math.random() > 0.6) {
        segment.obstacles.push({ type: 'data-barrier', xOffset: 250 });
      }
      return segment;
    }

    if (kind === 'platform-reward') {
      const platformY = GROUND_Y - Phaser.Math.Between(96, 138);
      segment.platforms.push({ xOffset: 72, y: platformY, width: 180, sinking: Math.random() > 0.72 });
      this.addShardLine(segment, 26, platformY - 48, 4, 42);
      if (Math.random() > 0.55) {
        segment.collectibles.push({ type: 'energy-orb', xOffset: 160, y: platformY - 70 });
      }
      segment.obstacles.push({ type: 'data-crack', xOffset: 300 });
      return segment;
    }

    if (kind === 'bounce-route') {
      const platformY = GROUND_Y - 150;
      segment.bouncePads.push({ xOffset: 0, y: GROUND_Y - 12 });
      segment.platforms.push({ xOffset: 210, y: platformY, width: 170 });
      this.addShardArc(segment, 120, platformY - 44, 5, 48, 42);
      segment.collectibles.push({ type: 'energy-orb', xOffset: 256, y: platformY - 78 });
      return segment;
    }

    if (kind === 'laser-rhythm') {
      segment.obstacles.push({ type: 'laser-gate', xOffset: 0 });
      segment.obstacles.push({ type: Math.random() > 0.52 ? 'data-crack' : 'data-barrier', xOffset: 250 });
      this.addShardLine(segment, 86, GROUND_Y - 170, 3, 44);
      return segment;
    }

    if (kind === 'supply-crate') {
      segment.crates.push({ xOffset: 110, y: GROUND_Y - 172 });
      this.addShardLine(segment, 0, GROUND_Y - 112, 3, 48);
      return segment;
    }

    segment.bouncePads.push({ xOffset: 0, y: GROUND_Y - 12 });
    segment.obstacles.push({ type: 'data-barrier', xOffset: 190 });
    segment.obstacles.push({ type: 'laser-gate', xOffset: 430 });
    this.addShardArc(segment, 74, GROUND_Y - 130, 6, 52, 84);
    return segment;
  }

  private addShardLine(segment: SegmentPlan, xOffset: number, y: number, count: number, gap: number): void {
    for (let i = 0; i < count; i += 1) {
      segment.collectibles.push({ type: 'inspiration-shard', xOffset: xOffset + i * gap, y });
    }
  }

  private addShardArc(segment: SegmentPlan, xOffset: number, baseY: number, count: number, gap: number, height: number): void {
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0 : i / (count - 1);
      const arc = Math.sin(t * Math.PI) * height;
      segment.collectibles.push({ type: 'inspiration-shard', xOffset: xOffset + i * gap, y: baseY - arc });
    }
  }
}
