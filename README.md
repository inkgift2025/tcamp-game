# 鹅影回廊：Tcamp逃亡测试

**Goose Shadow Runner**

一只还没完成作品的小企鹅创作者，在崩坏的 Tcamp 虚拟训练营里被白鹅 AI 程序 G-00SE 追着跑，必须在鹅影压力追上自己之前尽可能坚持下去。

## 技术栈

- Vite
- TypeScript
- Phaser
- HTML / CSS
- GSAP

## 如何运行

安装依赖：

```bash
npm install
```

启动本地开发服务器：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 操作方式

| 操作 | 按键 |
| --- | --- |
| 跳跃 | `Space` / `W` / `↑` |
| 下滑 | `S` / `↓` |
| 重新开始 | `R` |

## 当前 MVP 已完成

- [x] Vite + Phaser + TypeScript 项目初始化
- [x] 960 x 540 固定设计尺寸，自动适配浏览器窗口
- [x] 蓝紫赛博训练营风格背景、速度线、数据线和地面平台
- [x] HTML/CSS 开始页：标题、副标题、操作说明、发光开始按钮、鹅影和企鹅主视觉占位
- [x] 跑酷场景：自动奔跑、跳跃、下滑、障碍从右向左移动
- [x] 玩家小企鹅：Graphics 绘制、白肚皮、小眼睛、科技背包、跑步浮动、跳跃拖尾、下滑压低、受击闪烁
- [x] G-00SE 鹅影：随鹅影压力靠近、透明度增强、红色边缘警报
- [x] 两类障碍：数据路障需要跳跃，激光门需要下滑
- [x] 鹅影压力系统：0-100，碰撞增加压力，满值失败，无敌时间防止连续判定
- [x] HTML/CSS HUD：分数、存活时间、当前阶段、鹅影压力条、底部操作提示
- [x] 分数系统：随存活时间增长，成功躲过障碍加分
- [x] 可收集物：能量球降低鹅影压力，灵感碎片提供高分奖励
- [x] 拾取反馈：发光粒子、弹字提示、HUD 收集数量统计
- [x] 四阶段地图雏形：启动大厅、数据走廊、能源管道、主控塔
- [x] 阶段化体验：背景配色、速度成长、障碍频率、激光门比例随阶段变化
- [x] 阶段切换提示：进入新区域时显示区域名和系统提示
- [x] 程序化音效：跳跃、下滑、拾取、碰撞、阶段切换、失败和高压警报
- [x] 无外部音频素材：使用 WebAudio 动态生成电子音效
- [x] 120 秒成功结局：坚持到终点后进入“完成测试”结算页
- [x] 结算分支：失败和成功使用不同背景、文案、鹅影状态和按钮文本
- [x] HTML/CSS 结算页：最终分数、存活时间、最高分、本地存储、按钮和 R 键重开
- [x] BootScene 素材加载管线：统一 manifest、AssetKeys 和缺图 fallback texture
- [x] 游戏速度随时间缓慢增加
- [x] 体验修复：画布完整适配、HUD 安全边距、跑道上移、障碍去重伤害、下滑判定校准
- [x] 调试开关：`DEBUG_HITBOXES` 默认关闭，可在 `gameConfig.ts` 中打开查看碰撞盒

## 项目结构

```text
src/
  main.ts
  game/
    scenes/
      BootScene.ts
      StartScene.ts
      RunScene.ts
      ResultScene.ts
    objects/
      Player.ts
      GooseShadow.ts
      Obstacle.ts
      Collectible.ts
      Platform.ts
      BouncePad.ts
      SupplyCrate.ts
    systems/
      AssetKeys.ts
      BackgroundSystem.ts
      HudBridge.ts
      PressureSystem.ts
      ScoreSystem.ts
      SpawnSystem.ts
      StageSystem.ts
      SoundSystem.ts
    config/
      assetManifest.ts
      visualTheme.ts
      gameConfig.ts
      balanceConfig.ts
      stageConfig.ts
  ui/
    startScreen.ts
    hudOverlay.ts
    resultScreen.ts
    uiTypes.ts
  styles/
    global.css
    ui.css
```

## 下一步建议

1. 增加阶段内任务目标，例如收集足够灵感碎片后解锁系统日志。
2. 为不同阶段增加更明确的背景装置，例如能源管道蒸汽、主控塔核心脉冲。
3. 增加音效开关和音量设置，方便网页小游戏场景下静音游玩。
4. 做一轮数值调优：障碍间距、道具频率、120 秒内压力恢复节奏。
