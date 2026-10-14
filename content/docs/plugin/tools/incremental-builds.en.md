---
title: "Build on save and up-to-date checks"
description: "The published DreamFX save workflow: incremental updates, full rebuild fallbacks and provenance checks."
---

# Build on save and up-to-date checks

Saving source in the editor uses incremental builds by default. This page preserves the existing
website address `plugin/tools/incremental-builds` and its section links. The complete published
reference is [Incremental builds](/en/docs/plugin/tools/incremental-build-reference).

## Published build scope [#incremental-builds]

A save compares the new build plan with the digest stored by the previous successful build and
writes only the difference. If the stored state cannot be trusted, it falls back to a full rebuild.
Explicit editor rebuild commands and command-line builds without `-Incremental` use full builds.

## Build sequence [#how-it-works]

The generator resolves the source and its dependencies, compares the resulting plan with the
stored digest, applies the required writes, verifies Niagara compilation, stamps provenance and
saves if validation permits it. See [how incremental builds work](/en/docs/plugin/tools/incremental-build-reference#how-it-works)
and the [build pipeline](/en/docs/generation/pipeline).

## Saving source in the editor

The watcher queues changed `.dfs`, `.dfe` and `.dfm` sources and builds dependencies before their
consumers. Save-triggered system rebuilds use incremental generation by default. **Rebuild DFX**,
**Rebuild from Source** and the bulk-batch **Rebuild them now** action always rebuild in full.
Batches above **Bulk Rebuild Threshold** (default **8**) wait for confirmation; see the
[bulk-batch gate](/en/docs/tools/editor#the-bulk-batch).

## Available controls [#switching-it-on-and-off]

**Project Settings → Plugins → DreamFX → Workspace → Incremental Build on Save**
(`bIncrementalBuildOnSave`, default on) controls save-triggered incremental builds. Command-line
builds opt in with `-Incremental`, which is off by default and should not be used in CI gates.
See the [control table](/en/docs/plugin/tools/incremental-build-reference#switching-it-on-and-off).

## Unchanged sources can be skipped

An ordinary headless build can report `up to date` when the asset's provenance matches its source.
Skipping a build and incrementally applying a changed plan are separate operations.

```powershell
# Build if the generated asset is out of date, using a full build.
pwsh -File Plugins/DreamFX/.skill/dfx.ps1 build DFX/Effects/NS_Hello.dfs
# Opt in to incremental generation for a local edit loop.
pwsh -File Plugins/DreamFX/.skill/dfx.ps1 build DFX/Effects/NS_Hello.dfs -Incremental
# Request a full rebuild even when provenance matches.
pwsh -File Plugins/DreamFX/.skill/dfx.ps1 build DFX/Effects/NS_Hello.dfs -Force
# Check provenance without repairing the asset.
pwsh -File Plugins/DreamFX/.skill/dfx.ps1 verify DFX/Effects/NS_Hello.dfs
```

Close the editor before package-writing headless commands. See
[provenance and verification](/en/docs/generation/provenance) for source-location rules.

## Source changes and build cost [#what-each-kind-of-edit-costs]

A value edit can write only the changed input. Structural changes can rebuild a stack, emitter or
the whole system; the engine's write path also affects which partial edits are supported. See the
[per-edit table](/en/docs/plugin/tools/incremental-build-reference#what-each-kind-of-edit-costs) for the published measurements
and scope.

### Niagara compilation [#compile]

Incremental builds request an ordinary, non-forced Niagara compile; full rebuilds force compilation.
Both verify the resulting executable data and force a recompile if it is stale. See
[headless compilation](/en/docs/tools/cli).

### Module schema probes [#module-probes-are-made-once]

Planning reuses one module library per process, so required probes run once per editor session or
commandlet run. The first build can be slower. Use `dfx.ps1 schema <Module>` to inspect real inputs;
see [module probes](/en/docs/plugin/tools/incremental-build-reference#module-probes-are-made-once).

## Full rebuild behavior [#when-it-falls-back-to-a-full-rebuild]

New assets, missing or incompatible digests, externally changed asset facts and unsupported
structural changes trigger a full rebuild. A failed incremental write also falls back during the
same build. The Output Log records the reason; see the complete
[fallback table](/en/docs/plugin/tools/incremental-build-reference#when-it-falls-back-to-a-full-rebuild).

## Interpreting build output [#reading-the-log]

The watcher and commandlet report incremental write counts or `full rebuild (<reason>)` per file.
`up to date` denotes a provenance skip. See the [log examples](/en/docs/plugin/tools/incremental-build-reference#reading-the-log).

## Protecting editor-authored values

The build safety gate can refuse a save that loses undeclared asset state (`DFX8018`). Explicit CLI
`-Force` can permit that loss with warnings; editor rebuild requests do not bypass the gate.
Use [pull](/en/docs/plugin/tools/pull) or [Write Back to Source](/en/docs/tools/editor#write-back-to-source) to bring
eligible tuned asset values into source before rebuilding.

## Verification

CI gates should use the full-build path: lint, build, verify and corpus. Keep `-Incremental` out of
gates. See the [command line](/en/docs/tools/cli) and [CI sequence](/en/docs/tools/ci).

### What the checks establish [#the-equivalence-guarantee]

Incremental generation must produce the same asset as a full rebuild of the same text. The published
[incremental equivalence tests](/en/docs/plugin/tools/incremental-build-reference#the-equivalence-guarantee) compare asset facts,
node names, inputs and decompiled text. Runtime visual equivalence is a separate check; see
[round trip and equivalence](/en/docs/generation/roundtrip).

## Diagnosing a rebuild [#troubleshooting]

Read the `full rebuild (<reason>)` line for unexpected fallback. An asset edited outside DreamFX
requires a full rebuild before its next trusted incremental build. Use **Rebuild from Source** to
obtain the full-build result if an asset looks wrong; keep both results if they disagree. See
[troubleshooting](/en/docs/plugin/tools/incremental-build-reference#troubleshooting).

## Related references [#see-also]

- [Incremental builds](/en/docs/plugin/tools/incremental-build-reference).
- [Editor integration](/en/docs/tools/editor).
- [Headless compilation](/en/docs/tools/cli).
- [Provenance and verification](/en/docs/generation/provenance).
- [Diagnostic catalog](/en/docs/plugin/diagnostics/readme).
