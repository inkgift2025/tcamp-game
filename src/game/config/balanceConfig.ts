export const balanceConfig = {
  player: {
    x: 245,
    startY: 318,
    width: 78,
    height: 108,
    slideHeight: 48,
    jumpVelocity: -575,
    doubleJumpVelocity: -500,
    bounceVelocity: -820,
    invulnerableMs: 1000,
  },
  run: {
    baseSpeed: 325,
    maxSpeed: 560,
    speedGainPerSecond: 5.5,
    successSeconds: 120,
    spawnMinMs: 1080,
    spawnMaxMs: 1650,
    obstacleMinGapPx: 420,
    obstacleMaxGapPx: 520,
    maxActiveObstacles: 2,
    segmentMinGapPx: 510,
    segmentMaxGapPx: 720,
    collectibleSpawnMinMs: 2200,
    collectibleSpawnMaxMs: 3400,
    obstacleCleanupX: -120,
  },
  pressure: {
    max: 100,
    dataBarrierHit: 10,
    laserGateHit: 16,
    energyOrbReduce: 15,
    dashSurviveReduce: 15,
    dashHitPenalty: 8,
  },
  score: {
    pointsPerSecond: 12,
    obstacleClearBonus: 35,
    energyOrbBonus: 40,
    inspirationShardBonus: 150,
  },
};

export type ObstacleType = 'data-barrier' | 'laser-gate' | 'data-crack';
export type CollectibleType = 'energy-orb' | 'inspiration-shard';
