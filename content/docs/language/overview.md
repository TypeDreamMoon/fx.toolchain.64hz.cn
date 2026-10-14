---
title: "DreamFXLang 参考"
description: "DreamFXLang 参考"
---

# DreamFXLang 参考 [#dreamfxlang-reference]

这门语言按你所写的内容划分。凡规则因引擎所迫而存在的 —— 栈为什么是语句列表、表达式白名单为什么很短、`#Region` 为什么只是注释 —— 页面都会在陈述该规则之处说明原因。

| 页面 | 涵盖内容 |
| --- | --- |
| [dfs.md](/docs/language/dfs) | `.dfs` —— 一个系统：user 参数、系统栈、发射器、renderer |
| [dfe.md](/docs/language/dfe) | `.dfe` —— 一个可复用发射器，以及 `from` 对它做了什么 |
| [system-inheritance.md](/docs/plugin/language/system-inheritance) | `.dfs` 源父级、覆盖、依赖重建和循环错误 |
| [native-emitter-inheritance.md](/docs/plugin/language/native-emitter-inheritance) | 带 `inherits` 的原生 Niagara 发射器父级 |
| [dfm.md](/docs/language/dfm) | `.dfm` —— 一个模块或 dynamic input，以及哪些引擎能生成它 |
| [values.md](/docs/language/values) | 每一个值位置、类型规则，以及按名称列出的八条 `L*` 规则 |

## 每个文件的形状 [#shape-of-every-file]

一个顶层对象，在所有地方都用相同的头声明：

```cpp
<Kind>(Name="<path under the root>", Root="<root token>")
{
    ...
}
```

`Kind` 是 `System`、`Emitter`、`Module` 或 `DynamicInput`，并且必须与文件扩展名一致
(DFX2021)。`Root` 是 `Game`、空(同样含义)或 `Plugin.<PluginName>`；`Name` 是相对于该根的内容目录的资源
路径。

系统还接受 `Parent="../Base.dfs"`，用于[源继承](/docs/plugin/language/system-inheritance)。
发射器声明可以使用 `inherits "/Game/FX/NE_Base"` 指定
[原生 Niagara 父级](/docs/plugin/language/native-emitter-inheritance)。发射器 `from` 保留其源拷贝语义；
对 `.dfe` 的编辑会通过源监视器重建依赖系统。

块使用 `Name = { ... }`，语句以 `;` 结尾，`//` 和 `/* */` 是注释。
属性以方括号形式挂在声明上：`[ Group="Burst"; SortPriority=10 ]`。
在 `Properties` / `Inputs` 内部，`Group("Name") { ... }` 作用域会把这两个属性加盖到
其中包含的每一个参数上 —— 参见 [dfs.md](/docs/language/dfs)。

## 有意不在这里的东西 [#what-is-deliberately-not-here]

- **`MaterialParam`。** 保留(L8)，未实现(DFX5093)。
- **任何需要通用表达式编译器的东西。** 参见 [values.md](/docs/language/values) 中的 L6。
