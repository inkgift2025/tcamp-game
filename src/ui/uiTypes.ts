export interface UiOverlayHandle {
  element: HTMLElement;
  hide: () => void;
  destroy: () => void;
}

export interface StartScreenOptions {
  onStart: () => void;
}

export interface HudOverlayState {
  score: number;
  time: number;
  stageName: string;
  pressure: number;
  shards?: number;
  dashActive?: boolean;
}

export interface HudOverlayHandle extends UiOverlayHandle {
  update: (state: HudOverlayState) => void;
  updateScore: (score: number) => void;
  updateTime: (time: number) => void;
  updateStage: (stageName: string) => void;
  updatePressure: (value: number) => void;
  flash: (color?: number) => void;
  setPaused: (paused: boolean) => void;
}

export interface HudOverlayOptions {
  onTogglePause: () => void;
  onReturnHome: () => void;
}

export interface ResultScreenOptions {
  outcome: 'failure' | 'success';
  score: number;
  seconds: number;
  best: number;
  energyOrbs: number;
  inspirationShards: number;
  onRestart: () => void;
}
