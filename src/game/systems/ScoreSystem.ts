import { balanceConfig } from '../config/balanceConfig';

export class ScoreSystem {
  private score = 0;
  private aliveMs = 0;
  private energyOrbs = 0;
  private inspirationShards = 0;

  reset(): void {
    this.score = 0;
    this.aliveMs = 0;
    this.energyOrbs = 0;
    this.inspirationShards = 0;
  }

  update(deltaMs: number): void {
    this.aliveMs += deltaMs;
    this.score += (balanceConfig.score.pointsPerSecond * deltaMs) / 1000;
  }

  addObstacleClear(): void {
    this.score += balanceConfig.score.obstacleClearBonus;
  }

  addEnergyOrb(): void {
    this.energyOrbs += 1;
    this.score += balanceConfig.score.energyOrbBonus;
  }

  addInspirationShard(): void {
    this.inspirationShards += 1;
    this.score += balanceConfig.score.inspirationShardBonus;
  }

  getScore(): number {
    return Math.floor(this.score);
  }

  getAliveSeconds(): number {
    return this.aliveMs / 1000;
  }

  getEnergyOrbs(): number {
    return this.energyOrbs;
  }

  getInspirationShards(): number {
    return this.inspirationShards;
  }
}
