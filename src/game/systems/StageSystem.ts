import { RunStageConfig, stageConfigs } from '../config/stageConfig';

export class StageSystem {
  private current = stageConfigs[0];

  reset(): void {
    this.current = stageConfigs[0];
  }

  update(aliveSeconds: number): { stage: RunStageConfig; changed: boolean } {
    const next = this.getStageForTime(aliveSeconds);
    const changed = next.id !== this.current.id;
    this.current = next;
    return { stage: this.current, changed };
  }

  getCurrentStage(): RunStageConfig {
    return this.current;
  }

  private getStageForTime(aliveSeconds: number): RunStageConfig {
    for (let i = stageConfigs.length - 1; i >= 0; i -= 1) {
      if (aliveSeconds >= stageConfigs[i].startsAt) {
        return stageConfigs[i];
      }
    }
    return stageConfigs[0];
  }
}
