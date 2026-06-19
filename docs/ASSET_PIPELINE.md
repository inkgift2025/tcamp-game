# Asset Pipeline

## 为什么改成素材驱动

当前目标是把《鹅影回廊：Tcamp逃亡测试》从 Phaser Graphics 手绘 Demo，调整为“素材驱动 + HTML/CSS 高级 UI + Phaser 游戏逻辑”的结构。Phaser 继续负责跑酷逻辑、碰撞、生成、压力值和背景滚动；角色、鹅影、平台、障碍、道具、背景逐步改为 PNG、spritesheet 或 texture atlas；开始页、HUD、结算页由 DOM 和 CSS 管理。

## 目录结构

素材放在 `public/assets/` 下：

- `characters/penguin/`：小企鹅主角动作素材。
- `characters/goose/`：G-00SE 白鹅追击素材。
- `backgrounds/launch_hall/`：启动大厅 far/mid/near 背景层。
- `backgrounds/data_corridor/`：数据走廊 far/mid/near 背景层。
- `backgrounds/energy_pipeline/`：能源管道 far/mid/near 背景层。
- `tiles/`：地面砖、浮空平台、下沉平台。
- `obstacles/`：数据路障、激光门、数据裂缝。
- `items/`：灵感碎片、能量球、弹跳节点、补给箱。
- `ui/`：面板、按钮、压力图标、分数图标等 UI 图片素材。
- `references/`：参考图，只用于风格和制作指导，不直接当作游戏背景。

## 放入图片

把生成好的 PNG 或 spritesheet 放进对应目录。例如小企鹅跑步独立帧放到：

```text
public/assets/characters/penguin/penguin_run.png
```

Vite 会把 `public/` 作为站点根目录，所以运行时路径写成：

```text
/assets/characters/penguin/penguin_run.png
```

## 登记素材

在 `src/game/config/assetManifest.ts` 中新增或修改素材项：

```ts
{
  key: ASSET_KEYS.characters.penguinRun,
  path: '/assets/characters/penguin/penguin_run.png',
  kind: 'character',
  description: '小企鹅跑步图',
}
```

key 统一从 `src/game/systems/AssetKeys.ts` 引用，避免在 Player、GooseShadow、BackgroundSystem 等文件里重复硬编码字符串。

## BootScene 加载

`BootScene` 是第一个 Scene。它遍历 `ASSET_MANIFEST`，对每一项执行 `this.load.image(asset.key, asset.path)`。加载完成后，它检查每个 key 是否存在；如果图片缺失或加载失败，就创建同 key 的 fallback texture，然后进入 `StartScene`。

## 在游戏对象中使用

后续替换 Player、GooseShadow、BackgroundSystem 时应引用统一 key：

```ts
this.add.sprite(x, y, ASSET_KEYS.characters.penguinRun);
```

背景系统可以按阶段选择：

```ts
ASSET_KEYS.backgrounds.launchHallFar
ASSET_KEYS.backgrounds.launchHallMid
ASSET_KEYS.backgrounds.launchHallNear
```

障碍和道具对象同样引用 `ASSET_KEYS.obstacles`、`ASSET_KEYS.items`、`ASSET_KEYS.platforms`。

## fallback 如何工作

缺图时 `BootScene` 会生成临时纹理：

- 角色：简单企鹅或白鹅轮廓。
- 背景：蓝紫渐变和数据线。
- 平台：发光矩形。
- 障碍：警报色危险块。
- 道具：发光圆形。
- UI：玻璃拟态面板占位。

这些 fallback 只保证项目能运行，不是最终美术。正式素材导入后，同 key 的真实 PNG 会自动替代 fallback。

## 替换正式素材步骤

1. 按 `docs/NEXT_ART_TASKS.md` 生成下一组图片。
2. 把图片放入 `public/assets/` 对应目录。
3. 确认文件名与 `assetManifest.ts` 的 `path` 一致。
4. 如新增素材，先在 `AssetKeys.ts` 增加 key，再在 `assetManifest.ts` 登记。
5. 在 Player、GooseShadow、BackgroundSystem、Obstacle、Collectible 等对象里逐步把 Graphics 绘制替换为 sprite 或 image。
6. 执行 `npm run build`，再启动本地服务器检查 StartScreen、RunScene、ResultScreen 和 fallback 行为。
