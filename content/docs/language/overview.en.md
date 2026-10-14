---
title: "The file model"
description: "The shape every DreamFXLang file shares — header, blocks, statements, comments, attributes — and an index of the eight L rules."
---

# DreamFXLang reference

The language, split by what you are writing. Where a rule exists because the engine forced it —
why the stack is a statement list, why the expression whitelist is short, why `#Region` is only a
comment — the page says so where the rule is stated.

| Page | Covers |
| --- | --- |
| [dfs.md](/en/docs/language/dfs) | `.dfs` — a system: user parameters, system stacks, emitters, renderers |
| [dfe.md](/en/docs/language/dfe) | `.dfe` — a reusable emitter, and what `from` does to it |
| [system-inheritance.md](/en/docs/plugin/language/system-inheritance) | `.dfs` source parents, overrides, dependency rebuilding, and cycle errors |
| [native-emitter-inheritance.md](/en/docs/plugin/language/native-emitter-inheritance) | Native Niagara emitter parents with `inherits` |
| [dfm.md](/en/docs/language/dfm) | `.dfm` — a module or dynamic input, and which engines can generate one |
| [values.md](/en/docs/language/values) | Every value position, the type rules, and the eight `L*` rules by name |

## Shape of every file

One top-level object, declared with the same header everywhere:

```cpp
<Kind>(Name="<path under the root>", Root="<root token>")
{
    ...
}
```

`Kind` is `System`, `Emitter`, `Module` or `DynamicInput`, and has to agree with the file extension
(DFX2021). `Root` is `Game`, empty (the same thing), or `Plugin.<PluginName>`; `Name` is the asset
path relative to that root's content directory.

Systems additionally accept `Parent="../Base.dfs"` for [source inheritance](/en/docs/plugin/language/system-inheritance).
An emitter declaration can use `inherits "/Game/FX/NE_Base"` for a
[native Niagara parent](/en/docs/plugin/language/native-emitter-inheritance). Emitter `from` keeps its source-copy semantics;
edits to the `.dfe` rebuild dependent systems through the source watcher.

Blocks are `Name = { ... }`, statements end in `;`, and `//` and `/* */` are comments.
Attributes hang off a declaration in brackets: `[ Group="Burst"; SortPriority=10 ]`.
Inside `Properties` / `Inputs`, `Group("Name") { ... }` scopes stamp those two attributes onto
every parameter they contain — see [dfs.md](/en/docs/language/dfs).

## What is deliberately not here

- **`MaterialParam`.** Reserved (L8), not implemented (DFX5093).
- **Anything that would need a general expression compiler.** See L6 in [values.md](/en/docs/language/values).
