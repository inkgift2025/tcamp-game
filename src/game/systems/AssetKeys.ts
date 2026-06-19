export const ASSET_KEYS = {
  characters: {
    penguinSpritesheet: 'penguin_spritesheet',
    penguinIdle: 'penguin_idle',
    penguinRun: 'penguin_run',
    penguinJump: 'penguin_jump',
    penguinDoubleJump: 'penguin_double_jump',
    penguinCrouch: 'penguin_crouch',
    penguinHurt: 'penguin_hurt',
    gooseSpritesheet: 'goose_spritesheet',
    gooseRun: 'goose_run',
    gooseSprint: 'goose_sprint',
    gooseDanger: 'goose_danger',
  },
  backgrounds: {
    launchHallFar: 'launch_hall_far',
    launchHallMid: 'launch_hall_mid',
    launchHallNear: 'launch_hall_near',
    dataCorridorFar: 'data_corridor_far',
    dataCorridorMid: 'data_corridor_mid',
    dataCorridorNear: 'data_corridor_near',
    energyPipelineFar: 'energy_pipeline_far',
    energyPipelineMid: 'energy_pipeline_mid',
    energyPipelineNear: 'energy_pipeline_near',
  },
  platforms: {
    groundTile: 'ground_tile',
    floatingPlatform: 'floating_platform',
    sinkingPlatform: 'sinking_platform',
  },
  obstacles: {
    dataBarrier: 'data_barrier',
    laserGate: 'laser_gate',
    dataCrack: 'data_crack',
  },
  items: {
    inspirationShard: 'inspiration_shard',
    energyOrb: 'energy_orb',
    bouncePad: 'bounce_pad',
    supplyCrate: 'supply_crate',
  },
  ui: {
    panel: 'ui_panel',
    button: 'ui_button',
    pressureIcon: 'pressure_icon',
    scoreIcon: 'score_icon',
  },
} as const;

export const CHARACTER_ASSET_KEYS = ASSET_KEYS.characters;
export const BACKGROUND_ASSET_KEYS = ASSET_KEYS.backgrounds;
export const PLATFORM_ASSET_KEYS = ASSET_KEYS.platforms;
export const OBSTACLE_ASSET_KEYS = ASSET_KEYS.obstacles;
export const ITEM_ASSET_KEYS = ASSET_KEYS.items;
export const UI_ASSET_KEYS = ASSET_KEYS.ui;
