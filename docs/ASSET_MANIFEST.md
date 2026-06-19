# 鹅影回廊：Tcamp逃亡测试 美术参考包

这个包用于给 Codex / 游戏项目作为视觉参考，不建议直接把整张参考图当游戏贴图使用。正确做法是：

1. 把 `public/assets/references/` 中的 5 张图作为风格参考。
2. 后续再根据这些参考图生成或切出独立素材：角色、背景层、平台、障碍、道具、UI 组件。
3. Codex 应该把游戏改成“素材驱动”：Phaser 加载 PNG / SpriteSheet / Texture Atlas，HTML/CSS 做开始页、HUD、失败页。

## 文件说明

- `01_style_guide.png`：整体风格指南，蓝白赛博童话平台跑酷风。
- `02_environment_layers.png`：环境分层参考，适合拆成 far / mid / near 三层视差背景。
- `03_platform_level_design.png`：平台、台阶、跑道、关卡结构参考。
- `04_character_design.png`：小企鹅主角和追击者白鹅的角色参考。
- `05_ui_screens.png`：开始页、HUD、结算页 UI 参考。

## 推荐目标目录

```text
public/assets/
  references/
  characters/
  backgrounds/
  tiles/
  obstacles/
  items/
  ui/
```

