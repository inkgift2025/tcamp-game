# Goose Shadow Runner 正式素材包 v1

这个包可以直接解压到项目根目录。目录从 `public/assets/` 和 `docs/` 开始，适配当前 Codex 已创建的素材驱动结构。

## 重要说明

- `public/assets/references/` 里的图片是参考图和源图，不要直接作为游戏对象使用。
- `characters/`、`backgrounds/`、`tiles/`、`obstacles/`、`items/`、`ui/` 里的 PNG 是本次整理后的正式素材或临时可用素材。
- 角色精灵图已整理为等宽帧：
  - `penguin_spritesheet.png`: 7 帧，每帧 320x320
  - `goose_spritesheet.png`: 5 帧，每帧 420x320
- 部分素材由 AI 生成图自动抠图/切图得到，可能仍需 Codex 调整缩放、碰撞盒和帧坐标。

## 文件放置位置

解压后应得到：

```text
public/assets/characters/penguin/penguin_spritesheet.png
public/assets/characters/penguin/penguin_spritesheet.json
public/assets/characters/goose/goose_spritesheet.png
public/assets/characters/goose/goose_spritesheet.json
public/assets/backgrounds/launch_hall/launch_hall_far.png
public/assets/backgrounds/launch_hall/launch_hall_mid.png
public/assets/backgrounds/launch_hall/launch_hall_near.png
public/assets/backgrounds/data_corridor/data_corridor_far.png
public/assets/backgrounds/data_corridor/data_corridor_mid.png
public/assets/backgrounds/data_corridor/data_corridor_near.png
public/assets/backgrounds/energy_pipeline/energy_pipeline_far.png
public/assets/backgrounds/energy_pipeline/energy_pipeline_mid.png
public/assets/backgrounds/energy_pipeline/energy_pipeline_near.png
public/assets/tiles/ground_tile.png
public/assets/tiles/floating_platform.png
public/assets/tiles/sinking_platform.png
public/assets/obstacles/data_barrier.png
public/assets/obstacles/laser_gate.png
public/assets/obstacles/data_crack.png
public/assets/items/inspiration_shard.png
public/assets/items/energy_orb.png
public/assets/items/bounce_pad.png
public/assets/items/supply_crate.png
public/assets/ui/ui_panel.png
public/assets/ui/ui_button.png
public/assets/ui/pressure_icon.png
public/assets/ui/score_icon.png
```

## 推荐 Phaser spritesheet 配置

```ts
this.load.spritesheet('penguin_spritesheet', '/assets/characters/penguin/penguin_spritesheet.png', {
  frameWidth: 320,
  frameHeight: 320
});

this.load.spritesheet('goose_spritesheet', '/assets/characters/goose/goose_spritesheet.png', {
  frameWidth: 420,
  frameHeight: 320
});
```

## 推荐动画帧

小企鹅：
- idle: 0
- run: 1, 2
- jump: 3
- double_jump: 4
- crouch: 5
- hurt: 6

白鹅：
- run: 0, 1
- sprint: 2
- danger: 3
- attack_shadow: 4

