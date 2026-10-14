---
title: "溯源与 verify"
description: "生成资产上的戳记包含什么、verify 报告的漂移，以及四条 lint 规则。"
---

## 那枚戳 [#the-stamp]

DreamFX 生成的每个资产都带有一份溯源记录：

| 字段 | 用来回答 |
| --- | --- |
| 源路径 | 这个资产来自哪个 `.dfs` |
| 源哈希 | 那份源自此之后是否变过 |
| 生成器版本 | 是哪一版 DreamFX 构建的 |
| 模块版本 GUID | 它调用的那些模块自此之后是否变过 |

这枚戳有三个直接用途：**跳过未变更的源**（构建）、**发现失同步**（verify），以及
**识别出某个资产是生成的** —— 内容浏览器菜单正是据此知道该提供“打开源文件”而不是“导出”。

## `verify` 抓什么 [#what-verify-catches]

```bash
pwsh -File Plugins/DreamFX/.skill/dfx.ps1 verify -All
```

它什么都不写 —— 不写资产，也不写戳记 —— 只做比较。`.dfe` 文件会被跳过：它们
不生成资产，因此没有什么可比的。

| 码 | 意思 |
| --- | --- |
| [DFX7001](/docs/diagnostics/dfx7xxx#dfx7001) | 资产没有 DreamFX 戳记：它从来不是由这份源生成的，或者是手工制作的 |
| [DFX7002](/docs/diagnostics/dfx7xxx#dfx7002) | 资产**已过期**：它是由这份源的另一个修订版本生成的 |
| [DFX7003](/docs/diagnostics/dfx7xxx#dfx7003) | 资产由较旧版本的 DreamFX 生成（一个警告；建议重建） |
| [DFX7004](/docs/diagnostics/dfx7xxx#dfx7004) | 资产不存在：这份源从未被构建过 |
| [DFX7005](/docs/diagnostics/dfx7xxx#dfx7005) | 模块版本漂移（在 `-StrictVersions` 下为错误） |

> **注意：**
>
> **`verify` 是四步 CI 中唯一能抓到这种情况的一步**：有人编辑了一个 `.dfs`，没有
> 重建，就把两者都提交了。单跑 `build` 永远不会因此失败，因为构建会修复它。只有
> 把戳记与源进行比较，才能显示已提交的资产与已提交的文本
> 互相矛盾。

`-StrictVersions` 把 R7 模块版本不匹配从警告提升为错误。发布门禁需要如此：
用与文本所描述的不同模块构建出来的资产不得发布。

## 四条 lint 规则 [#the-four-lint-rules]

Lint 只读源，不碰资产，所以它是最快失败的一步：

| 码 | 抓什么 |
| --- | --- |
| [DFX7101](/docs/diagnostics/dfx7xxx#dfx7101) | GPU 发射器没有 `FixedBounds`。GPU 发射器无法计算自己的边界 |
| [DFX7102](/docs/diagnostics/dfx7xxx#dfx7102) | 基于速率的生成（`SpawnRate` / `SpawnPerUnit` / `SpawnPerFrame`）没有上限 |
| [DFX7103](/docs/diagnostics/dfx7xxx#dfx7103) | 随机性没有 `Determinism = true`，于是每次运行看起来都不一样 |
| [DFX7104](/docs/diagnostics/dfx7xxx#dfx7104) | 渲染器既没有 Material，也没有 DreamFX 为其类型所知的默认值 —— 它不会绘制 |

> **注意：**
>
> DFX7102 不把 `SpawnParticlesInGrid` 当作基于速率的生成：它和 `SpawnBurst` 一样是
> 每循环一次的爆发（X·Y·Z），上限由循环决定。Lint 规则必须贴合语义，不然它就会变成
> 噪音。

## 编辑器侧的同一件事 [#the-same-thing-from-the-editor]

*Tools ▸ DreamFX ▸ Verify DFX* 跑的是同一趟，并报告一条 toast：

| toast | 条件 |
| --- | --- |
| `DreamFX: {N} source(s) verified, all assets in step.` | 干净 |
| `DreamFX: {Drifted} of {N} source(s) out of step ({Failed} failed). See the Output Log.` | 有漂移或失败 |

## 手改了生成的资产会怎样 [#what-happens-if-you-hand-edit-a-generated-asset]

下一次重建会把它铲掉，不问你。这不是缺陷 —— 这是该模型的定义：
**文本是唯一真相**。

生成资产在编辑器里显示一条警告横幅，上面有一个指向其源文件的链接。在那里改。
