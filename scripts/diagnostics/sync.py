"""Regenerate the diagnostics pages from the DreamFX plugin's own docs.

The plugin keeps `Docs/diagnostics/DFXnxxx.md` half machine-written — the block between
`generated:begin` / `generated:end` holds each code's severity, message template and raise
sites, and `.skill/gen-diagnostics.ps1 -Check` is the gate that keeps it honest. This script
carries that split onto the site:

  * the generated half becomes a `<Dfx />` call, identical in both locales;
  * the English prose (Cause / Fix) is carried across verbatim;
  * the Chinese prose lives in `zh/DFXnxxx.md` here, under the same `## DFXnnnn` headings.

Run it after the plugin adds or reworks a code:

    python scripts/diagnostics/sync.py --plugin <path to Plugins/DreamFX>

A code with no Chinese prose is a hard error, so a new code cannot quietly ship
English-only on the Chinese side of the site.
"""

import argparse
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
DEFAULT_PLUGIN = r"I:\UnrealProject_Moon\DEV_58\DevTest\Plugins\DreamFX"
OUT = os.path.join(SITE, "content", "docs", "diagnostics")

FAMILIES = [
    ("DFX1xxx", "Driver and file I/O", "驱动与文件 I/O"),
    ("DFX2xxx", "Lexer and syntax", "词法与语法"),
    ("DFX3xxx", "Declarations and document structure", "声明与文档结构"),
    ("DFX4xxx", "Values, types and expressions", "值、类型与表达式"),
    ("DFX5xxx", "Generation and asset writing", "生成与资产写入"),
    ("DFX6xxx", "Niagara compilation", "Niagara 编译"),
    ("DFX7xxx", "Provenance, drift and lint", "溯源、漂移与 lint"),
    ("DFX8xxx", "Decompiler", "反编译器"),
]

SEV_ZH = {"error": "错误", "warning": "警告", "info": "提示"}

SECTION = re.compile(r"^## (DFX\d{4})\s*$", re.M)
GEN = re.compile(r"<!-- generated:begin \w+ -->\s*(.*?)\s*<!-- generated:end \w+ -->", re.S)
SEV = re.compile(r"\*\*Severity\*\*\s+(\w+)")
MSG = re.compile(r"\*\*Message\*\*\s*```\s*\n(.*?)\n```", re.S)
RAISED = re.compile(r"\*\*Raised by\*\*\s+(.*)", re.M)

# The plugin's docs link out with repo-relative paths; the site's routes replace them.
LINK_REWRITES = {
    "(../language/dfm.md)": "(/docs/language/dfm)",
    "(../language/dfs.md)": "(/docs/language/dfs)",
    "(../language/dfe.md)": "(/docs/language/dfe)",
    "(../language/values.md)": "(/docs/language/values)",
    "(../getting-started.md)": "(/docs/start/first-effect)",
    "(../tools/editor-integration.md)": "(/docs/tools/editor)",
}


def rewrite_links(text):
    for source, target in LINK_REWRITES.items():
        text = text.replace(source, target)
    return text


def short_raised(raised):
    """Trim the module prefix: `Source/DreamFX/Private/X.cpp:9` -> `X.cpp:9`."""
    return ", ".join(
        re.sub(r"^Source/DreamFX(Editor)?/Private/", "", site) for site in raised
    )


def dfx_call(entry):
    return '<Dfx sev="%s" msg={%s}%s />' % (
        entry["severity"],
        json.dumps(entry["message"]),
        ' raised="%s"' % short_raised(entry["raised"]) if entry["raised"] else "",
    )


def parse_family(plugin, family):
    path = os.path.join(plugin, "Docs", "diagnostics", family + ".md")
    raw = io.open(path, encoding="utf-8").read()
    parts = SECTION.split(raw)

    entries = []
    for index in range(1, len(parts), 2):
        code, body = parts[index], parts[index + 1]

        gen = GEN.search(body)
        if not gen:
            raise SystemExit("no generated block for " + code)

        block = gen.group(1)
        raised_match = RAISED.search(block)

        entries.append(
            {
                "code": code,
                "family": family,
                "severity": SEV.search(block).group(1),
                "message": MSG.search(block).group(1),
                "raised": re.findall(r"`([^`]+)`", raised_match.group(1))
                if raised_match
                else [],
                "prose": rewrite_links(body[gen.end():].strip()),
            }
        )

    return entries


def read_zh_prose(family):
    raw = io.open(os.path.join(HERE, "zh", family + ".md"), encoding="utf-8").read()
    parts = SECTION.split(raw)
    return {parts[i]: parts[i + 1].strip() for i in range(1, len(parts), 2)}


def severity_summary(entries, locale):
    counts = {}
    for entry in entries:
        counts[entry["severity"]] = counts.get(entry["severity"], 0) + 1
    order = ("error", "warning", "info")
    if locale == "zh":
        return " / ".join(
            "%d %s" % (counts[key], SEV_ZH[key]) for key in order if key in counts
        )
    return ", ".join("%d %s" % (counts[key], key) for key in order if key in counts)


def write(path, lines):
    io.open(path, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lines).rstrip() + "\n"
    )


def emit_family(family, title_en, title_zh, entries, zh_prose):
    for locale in ("zh", "en"):
        title = title_zh if locale == "zh" else title_en
        if locale == "zh":
            head = [
                "---",
                "title: %s — %s" % (family, title),
                "description: %s 段的全部诊断码，每条带严重级别、逐字消息、成因与修法。" % family,
                "---",
                "",
                "本族共 %d 条（%s）。消息是编译器持有的格式串：`%%s`、`%%d`、`%%c` 在运行时被替换掉。"
                % (len(entries), severity_summary(entries, locale)),
                "",
            ]
        else:
            head = [
                "---",
                "title: %s — %s" % (family, title),
                "description: Every %s diagnostic, with its severity, verbatim message, cause and fix."
                % family,
                "---",
                "",
                "%d codes in this family (%s). The message is the format string as the compiler holds "
                "it: `%%s`, `%%d` and `%%c` are substituted at runtime."
                % (len(entries), severity_summary(entries, locale)),
                "",
            ]

        lines = list(head)
        for entry in entries:
            prose = zh_prose[entry["code"]] if locale == "zh" else entry["prose"]
            lines += ["## %s" % entry["code"], "", dfx_call(entry), "", prose, ""]

        name = family.lower() + (".mdx" if locale == "zh" else ".en.mdx")
        write(os.path.join(OUT, name), lines)


INDEX_HEAD_ZH = """---
title: 诊断码
description: 全部 DFXnnnn 诊断码：怎么读一条诊断、八个族各自属于流水线的哪一段，以及按码速查。
---

DreamFX 的每一条诊断都是一个 `DFXnnnn`，带着**文件、行、列**：

```text
DFX/Effects/NS_Hello.dfs(31,17): error DFX3003: Module 'GravityForce' has no input named 'Gravty'.
Did you mean 'Gravity'? Available inputs: Gravity, CoordinateSpace
```

| | |
| --- | --- |
| 日志分类 | `LogDreamFX` |
| 严重级别 | `error` / `warning` / `info` —— 三级都真实使用 |
| 位置 | 每个码都带文件、行、列 |
| 编辑器里 | 失败的构建弹一条带 **Open in VSCode** 链接的 toast，直接跳到那一行那一列 |

**首位数字就是抛出它的阶段。** 这既是一条阅读线索，也是排错时该往哪里看的指路牌：

| 段 | 阶段 | 意味着 |
| --- | --- | --- |
| [`DFX1xxx`](/docs/diagnostics/dfx1xxx) | 驱动与文件 I/O | 文件读不了，或者词法层面就断了 |
| [`DFX2xxx`](/docs/diagnostics/dfx2xxx) | 词法与语法 | 语法不对：括号、分号、关键字 |
| [`DFX3xxx`](/docs/diagnostics/dfx3xxx) | 声明与文档结构 | 语法对了，但声明的东西对不上真实资产 |
| [`DFX4xxx`](/docs/diagnostics/dfx4xxx) | 值、类型与表达式 | 等号右边有问题 |
| [`DFX5xxx`](/docs/diagnostics/dfx5xxx) | 生成与资产写入 | 写资产这一步出了问题，或者有意的降级提示 |
| [`DFX6xxx`](/docs/diagnostics/dfx6xxx) | Niagara 编译 | 资产写出来了，Niagara 自己不满意 |
| [`DFX7xxx`](/docs/diagnostics/dfx7xxx) | 溯源、漂移与 lint | 资产与源码失同步，或者 lint 觉得不对劲 |
| [`DFX8xxx`](/docs/diagnostics/dfx8xxx) | 反编译器 | 导出、Adopt、往返缺口 |

<Callout type="info">
  文档的一半是**机器写的**：严重级别、消息模板和抛出位置从插件源码里扫出来，
  `gen-diagnostics.ps1 -Check` 是防止它漂移的门。人写的那一半 —— 成因与修法 —— 只写一次。
  见 [ci.ps1 与门禁](/docs/tools/ci)。
</Callout>

## 排错的顺序

<Steps>

<Step>
### 按码去查
本页下面的表，或者对应的族页面。码是稳定的：`DFX3003` 永远是同一个失败模式。
</Step>

<Step>
### 拿真实签名核对
`dfx.ps1 schema <Module> -Stack <Stack>` 打印构建看到的输入签名 ——
包括静态开关揭示出来的那些。名字的权威在资产上，不在记忆里。
</Step>

<Step>
### 还是不对，就看边界
[能力边界](/docs/diagnostics/limitations) 列出不覆盖的东西与 1.0.0 的已知问题。
</Step>

</Steps>

## 按码速查
"""

INDEX_HEAD_EN = """---
title: Diagnostics
description: Every DFXnnnn code — how to read one, which pipeline stage each family belongs to, and a lookup table by code.
---

Every DreamFX diagnostic is a `DFXnnnn` carrying a **file, line and column**:

```text
DFX/Effects/NS_Hello.dfs(31,17): error DFX3003: Module 'GravityForce' has no input named 'Gravty'.
Did you mean 'Gravity'? Available inputs: Gravity, CoordinateSpace
```

| | |
| --- | --- |
| Log category | `LogDreamFX` |
| Severities | `error` / `warning` / `info` — all three are really used |
| Position | every code carries file, line and column |
| In the editor | a failed build toasts with an **Open in VSCode** link straight to the line and column |

**The leading digit is the stage that raised it.** That is both a reading cue and a pointer at where
to look:

| Range | Stage | Means |
| --- | --- | --- |
| [`DFX1xxx`](/docs/diagnostics/dfx1xxx) | Driver and file I/O | the file could not be read, or the lexer stopped |
| [`DFX2xxx`](/docs/diagnostics/dfx2xxx) | Lexer and syntax | the grammar: braces, semicolons, keywords |
| [`DFX3xxx`](/docs/diagnostics/dfx3xxx) | Declarations and structure | the syntax is fine, but a declaration disagrees with the real asset |
| [`DFX4xxx`](/docs/diagnostics/dfx4xxx) | Values, types and expressions | something on the right of an `=` |
| [`DFX5xxx`](/docs/diagnostics/dfx5xxx) | Generation and asset writing | writing the asset failed, or a deliberate degradation is being announced |
| [`DFX6xxx`](/docs/diagnostics/dfx6xxx) | Niagara compilation | the asset was written and Niagara itself objects |
| [`DFX7xxx`](/docs/diagnostics/dfx7xxx) | Provenance, drift and lint | the asset and the source are out of step, or lint sees a hazard |
| [`DFX8xxx`](/docs/diagnostics/dfx8xxx) | Decompiler | export, Adopt, round-trip gaps |

<Callout type="info">
  Half of these pages are **machine-written**: severity, message template and raise sites are scanned
  out of the plugin sources, and `gen-diagnostics.ps1 -Check` is the gate that stops them drifting.
  The human half — cause and fix — is written once. See [ci.ps1 and gates](/docs/tools/ci).
</Callout>

## The order to debug in

<Steps>

<Step>
### Look the code up
The tables below, or the family page. Codes are stable: `DFX3003` is always the same failure mode.
</Step>

<Step>
### Check against the real signature
`dfx.ps1 schema <Module> -Stack <Stack>` prints the input signature as the build sees it — static
switches included. The authority on names is the asset, not memory.
</Step>

<Step>
### Still wrong? Read the limits
[Limits](/docs/diagnostics/limitations) lists what is not covered and the 1.0.0 known issues.
</Step>

</Steps>

## Lookup by code
"""


def truncate(message, limit=96):
    flat = message.replace("\\n", " ").replace("\n", " ").strip()
    return flat if len(flat) <= limit else flat[: limit - 1].rstrip() + "…"


def escape_cell(cell):
    return cell.replace("|", "\\|").replace("<", "&lt;").replace("{", "&#123;")


def emit_index(all_entries):
    for locale in ("zh", "en"):
        lines = [INDEX_HEAD_ZH if locale == "zh" else INDEX_HEAD_EN]

        for family, title_en, title_zh in FAMILIES:
            entries = all_entries[family]
            lines += [
                "",
                "### %s — %s" % (family, title_zh if locale == "zh" else title_en),
                "",
                "<Wide>",
                "",
                "| 码 | 级别 | 消息 |" if locale == "zh" else "| Code | Severity | Message |",
                "| --- | --- | --- |",
            ]
            for entry in entries:
                lines.append(
                    "| [%s](/docs/diagnostics/%s#%s) | %s | %s |"
                    % (
                        entry["code"],
                        entry["family"].lower(),
                        entry["code"].lower(),
                        SEV_ZH[entry["severity"]] if locale == "zh" else entry["severity"],
                        escape_cell(truncate(entry["message"])),
                    )
                )
            lines += ["", "</Wide>", ""]

        write(os.path.join(OUT, "index.mdx" if locale == "zh" else "index.en.mdx"), lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--plugin",
        default=os.environ.get("DREAMFX_PLUGIN", DEFAULT_PLUGIN),
        help="path to the DreamFX plugin root (holding Docs/diagnostics/)",
    )
    args = parser.parse_args()

    if not os.path.isdir(os.path.join(args.plugin, "Docs", "diagnostics")):
        raise SystemExit("no Docs/diagnostics under %s -- pass --plugin" % args.plugin)

    all_entries = {}
    total = 0

    for family, title_en, title_zh in FAMILIES:
        entries = parse_family(args.plugin, family)
        zh_prose = read_zh_prose(family)

        missing = [e["code"] for e in entries if e["code"] not in zh_prose]
        if missing:
            raise SystemExit(
                "%s: no Chinese prose for %s -- add it to scripts/diagnostics/zh/%s.md"
                % (family, ", ".join(missing), family)
            )

        emit_family(family, title_en, title_zh, entries, zh_prose)
        all_entries[family] = entries
        total += len(entries)
        print("%s: %d codes" % (family, len(entries)))

    emit_index(all_entries)
    print("index written; %d codes total" % total)


if __name__ == "__main__":
    main()
