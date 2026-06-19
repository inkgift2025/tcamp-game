import { ASSET_KEYS } from '../systems/AssetKeys';

export type AssetKind = 'character' | 'background' | 'tile' | 'obstacle' | 'item' | 'ui';
export type AssetLoadType = 'image' | 'spritesheet';

export interface ImageAssetDefinition {
  key: string;
  path: string;
  kind: AssetKind;
  description: string;
  type?: AssetLoadType;
  frameWidth?: number;
  frameHeight?: number;
}

const assetPath = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const ASSET_MANIFEST: ImageAssetDefinition[] = [
  {
    key: ASSET_KEYS.characters.penguinSpritesheet,
    path: assetPath('assets/characters/penguin/penguin_spritesheet.png'),
    kind: 'character',
    type: 'spritesheet',
    frameWidth: 320,
    frameHeight: 320,
    description: '小企鹅动作 spritesheet',
  },
  {
    key: ASSET_KEYS.characters.gooseSpritesheet,
    path: assetPath('assets/characters/goose/goose_spritesheet.png'),
    kind: 'character',
    type: 'spritesheet',
    frameWidth: 420,
    frameHeight: 320,
    description: '白鹅 AI 动作 spritesheet',
  },
  {
    key: ASSET_KEYS.backgrounds.launchHallFar,
    path: assetPath('assets/backgrounds/launch_hall/launch_hall_far.png'),
    kind: 'background',
    description: '启动大厅远景层',
  },
  {
    key: ASSET_KEYS.backgrounds.launchHallMid,
    path: assetPath('assets/backgrounds/launch_hall/launch_hall_mid.png'),
    kind: 'background',
    description: '启动大厅中景层',
  },
  {
    key: ASSET_KEYS.backgrounds.launchHallNear,
    path: assetPath('assets/backgrounds/launch_hall/launch_hall_near.png'),
    kind: 'background',
    description: '启动大厅近景层',
  },
  {
    key: ASSET_KEYS.backgrounds.dataCorridorFar,
    path: assetPath('assets/backgrounds/data_corridor/data_corridor_far.png'),
    kind: 'background',
    description: '数据走廊远景层',
  },
  {
    key: ASSET_KEYS.backgrounds.dataCorridorMid,
    path: assetPath('assets/backgrounds/data_corridor/data_corridor_mid.png'),
    kind: 'background',
    description: '数据走廊中景层',
  },
  {
    key: ASSET_KEYS.backgrounds.dataCorridorNear,
    path: assetPath('assets/backgrounds/data_corridor/data_corridor_near.png'),
    kind: 'background',
    description: '数据走廊近景层',
  },
  {
    key: ASSET_KEYS.backgrounds.energyPipelineFar,
    path: assetPath('assets/backgrounds/energy_pipeline/energy_pipeline_far.png'),
    kind: 'background',
    description: '能源管道远景层',
  },
  {
    key: ASSET_KEYS.backgrounds.energyPipelineMid,
    path: assetPath('assets/backgrounds/energy_pipeline/energy_pipeline_mid.png'),
    kind: 'background',
    description: '能源管道中景层',
  },
  {
    key: ASSET_KEYS.backgrounds.energyPipelineNear,
    path: assetPath('assets/backgrounds/energy_pipeline/energy_pipeline_near.png'),
    kind: 'background',
    description: '能源管道近景层',
  },
  {
    key: ASSET_KEYS.platforms.groundTile,
    path: assetPath('assets/tiles/ground_tile.png'),
    kind: 'tile',
    description: '地面砖块',
  },
  {
    key: ASSET_KEYS.platforms.floatingPlatform,
    path: assetPath('assets/tiles/floating_platform.png'),
    kind: 'tile',
    description: '浮空平台',
  },
  {
    key: ASSET_KEYS.platforms.sinkingPlatform,
    path: assetPath('assets/tiles/sinking_platform.png'),
    kind: 'tile',
    description: '下沉平台',
  },
  {
    key: ASSET_KEYS.obstacles.dataBarrier,
    path: assetPath('assets/obstacles/data_barrier.png'),
    kind: 'obstacle',
    description: '数据路障',
  },
  {
    key: ASSET_KEYS.obstacles.laserGate,
    path: assetPath('assets/obstacles/laser_gate.png'),
    kind: 'obstacle',
    description: '激光门',
  },
  {
    key: ASSET_KEYS.obstacles.dataCrack,
    path: assetPath('assets/obstacles/data_crack.png'),
    kind: 'obstacle',
    description: '断裂数据地板',
  },
  {
    key: ASSET_KEYS.items.inspirationShard,
    path: assetPath('assets/items/inspiration_shard.png'),
    kind: 'item',
    description: '灵感碎片',
  },
  {
    key: ASSET_KEYS.items.energyOrb,
    path: assetPath('assets/items/energy_orb.png'),
    kind: 'item',
    description: '能量球',
  },
  {
    key: ASSET_KEYS.items.bouncePad,
    path: assetPath('assets/items/bounce_pad.png'),
    kind: 'item',
    description: '弹跳节点',
  },
  {
    key: ASSET_KEYS.items.supplyCrate,
    path: assetPath('assets/items/supply_crate.png'),
    kind: 'item',
    description: '补给箱',
  },
  {
    key: ASSET_KEYS.ui.panel,
    path: assetPath('assets/ui/ui_panel.png'),
    kind: 'ui',
    description: 'UI 面板纹理',
  },
  {
    key: ASSET_KEYS.ui.button,
    path: assetPath('assets/ui/ui_button.png'),
    kind: 'ui',
    description: 'UI 按钮纹理',
  },
  {
    key: ASSET_KEYS.ui.pressureIcon,
    path: assetPath('assets/ui/pressure_icon.png'),
    kind: 'ui',
    description: '鹅影压力图标',
  },
  {
    key: ASSET_KEYS.ui.scoreIcon,
    path: assetPath('assets/ui/score_icon.png'),
    kind: 'ui',
    description: '分数图标',
  },
];
