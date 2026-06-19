export type StageId = 'launch-hall' | 'data-corridor' | 'energy-pipeline';

export interface RunStageConfig {
  id: StageId;
  name: string;
  subtitle: string;
  startsAt: number;
  palette: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
    band: number;
    ground: number;
    accent: number;
    secondary: number;
    warning: number;
  };
  speedGainMultiplier: number;
  maxSpeedBonus: number;
  obstacleIntervalMultiplier: number;
  collectibleIntervalMultiplier: number;
  laserChance: number;
  lineDensity: number;
}

export const stageConfigs: RunStageConfig[] = [
  {
    id: 'launch-hall',
    name: '启动大厅',
    subtitle: '蓝白训练营上线，先沿着灵感碎片热身。',
    startsAt: 0,
    palette: {
      topLeft: 0x9adfff,
      topRight: 0x5aa6ff,
      bottomLeft: 0x12376f,
      bottomRight: 0x07143a,
      band: 0x1d6bff,
      ground: 0x0a2557,
      accent: 0x4debff,
      secondary: 0x1d6bff,
      warning: 0xff9a3d,
    },
    speedGainMultiplier: 1,
    maxSpeedBonus: 0,
    obstacleIntervalMultiplier: 1,
    collectibleIntervalMultiplier: 1,
    laserChance: 0.14,
    lineDensity: 0.82,
  },
  {
    id: 'data-corridor',
    name: '数据走廊',
    subtitle: '悬浮面板与紫色数据管道开始变密。',
    startsAt: 25,
    palette: {
      topLeft: 0x153e91,
      topRight: 0x6c4dff,
      bottomLeft: 0x07143a,
      bottomRight: 0x1b0e55,
      band: 0x152d79,
      ground: 0x101b4f,
      accent: 0x4debff,
      secondary: 0x8b64ff,
      warning: 0xff4d6d,
    },
    speedGainMultiplier: 1.12,
    maxSpeedBonus: 35,
    obstacleIntervalMultiplier: 0.9,
    collectibleIntervalMultiplier: 0.95,
    laserChance: 0.36,
    lineDensity: 1.22,
  },
  {
    id: 'energy-pipeline',
    name: '能源管道',
    subtitle: '橙色能源线升温，G-00SE 会发起冲刺。',
    startsAt: 55,
    palette: {
      topLeft: 0x0d1d54,
      topRight: 0x37154d,
      bottomLeft: 0x050a1f,
      bottomRight: 0x3a1706,
      band: 0x241747,
      ground: 0x11172d,
      accent: 0xff9a3d,
      secondary: 0x4debff,
      warning: 0xff4d6d,
    },
    speedGainMultiplier: 1.24,
    maxSpeedBonus: 70,
    obstacleIntervalMultiplier: 0.82,
    collectibleIntervalMultiplier: 0.9,
    laserChance: 0.54,
    lineDensity: 1.42,
  },
];
