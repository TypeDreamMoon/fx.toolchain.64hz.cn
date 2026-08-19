import type { Locale } from '@/lib/i18n';
import { Bot, CodeXml, Puzzle, Recycle, type LucideIcon } from 'lucide-react';

export type HomeVersion = readonly [label: string, value: string];
export type WorkflowStep = readonly [index: string, title: string, text: string];

/**
 * `href` is locale-neutral — sections localize it through `localizedPath`.
 */
export type ReadingRoute = readonly [title: string, text: string, href: string];

export type EcosystemItem = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Locale-neutral docs path, or an absolute url when `external`. */
  href: string;
  external?: boolean;
};

/** One span of the hero sample. A bare string is unhighlighted text. */
export type CodeToken = string | readonly [text: string, kind: TokenKind];
export type TokenKind = 'kw' | 'type' | 'fn' | 'str' | 'num' | 'prop' | 'punct';

export type HomeCopy = {
  hero: {
    kicker: string;
    title: string[];
    lead: string;
    primary: string;
    secondary: string;
    versionsLabel: string;
    artAlt: string;
    artCaption: string;
    scrollCue: string;
  };
  railLabel: string;
  slides: readonly (readonly [id: string, label: string])[];
  sample: {
    kicker: string;
    title: string;
    lead: string;
    file: string;
    result: string;
    command: string;
  };
  versions: HomeVersion[];
  workflow: {
    kicker: string;
    title: string;
    lead: string;
    steps: WorkflowStep[];
  };
  tools: {
    kicker: string;
    title: string;
    lead: string;
    items: EcosystemItem[];
  };
  docs: {
    kicker: string;
    title: string;
    lead: string;
    routes: ReadingRoute[];
  };
};

/**
 * The first effect from the manual, hand-tokenized. It is a real, complete
 * source file — the panel is the page's evidence, not decoration.
 */
export const heroSample: readonly (readonly CodeToken[])[] = [
  [['System', 'kw'], ['(', 'punct'], ['Name', 'prop'], ['=', 'punct'], ['"Effects/NS_Hello"', 'str'], ', ', ['Root', 'prop'], ['=', 'punct'], ['"Game"', 'str'], [')', 'punct']],
  [['{', 'punct']],
  ['    ', ['Properties', 'kw'], ' = ', ['{', 'punct']],
  ['        ', ['float', 'type'], ' Speed = ', ['150.0', 'num'], ';'],
  ['    ', ['}', 'punct']],
  [],
  ['    ', ['Emitter', 'kw'], ' Motes'],
  ['    ', ['{', 'punct']],
  ['        ', ['Settings', 'kw'], ' = ', ['{', 'punct'], ' ', ['SimTarget', 'prop'], ' = CPU; ', ['Determinism', 'prop'], ' = ', ['true', 'num'], '; ', ['}', 'punct']],
  ['        ', ['EmitterUpdate', 'kw'], ' = ', ['{', 'punct']],
  ['            ', ['EmitterState', 'fn'], ['(', 'punct'], ['LifeCycleMode', 'prop'], ' = Self', [')', 'punct'], ';'],
  ['            ', ['SpawnRate', 'fn'], ['(', 'punct'], ['SpawnRate', 'prop'], ' = ', ['20.0', 'num'], [')', 'punct'], ';'],
  ['        ', ['}', 'punct']],
  [],
  ['        ', ['ParticleSpawn', 'kw'], ' = ', ['{', 'punct']],
  ['            ', ['SystemLocation', 'fn'], ['(', 'punct'], [')', 'punct'], ';'],
  ['            ', ['AddVelocityInCone', 'fn'], ['(', 'punct'], ['VelocityStrength', 'prop'], ' = ', ['User', 'prop'], '.Speed', [')', 'punct'], ';'],
  ['        ', ['}', 'punct']],
  ['        ', ['ParticleUpdate', 'kw'], ' = ', ['{', 'punct']],
  ['            ', ['ParticleState', 'fn'], ['(', 'punct'], [')', 'punct'], ';'],
  ['            ', ['GravityForce', 'fn'], ['(', 'punct'], ['Gravity', 'prop'], ' = ', ['(', 'punct'], ['0', 'num'], ', ', ['0', 'num'], ', ', ['-400', 'num'], [')', 'punct'], [')', 'punct'], ';'],
  ['            ', ['SolveForcesAndVelocity', 'fn'], ['(', 'punct'], [')', 'punct'], ';'],
  ['        ', ['}', 'punct']],
  ['        ', ['SpriteRenderer', 'kw'], ' Core ', ['{', 'punct'], ' ', ['FacingMode', 'prop'], ' = FaceCamera; ', ['}', 'punct']],
  ['    ', ['}', 'punct']],
  [['}', 'punct']],
];

export const homeCopies: Record<Locale, HomeCopy> = {
  zh: {
    hero: {
      kicker: '虚幻引擎 Niagara 特效语言',
      title: ['DreamFX', 'Lang'],
      lead: '用 .dfs / .dfe / .dfm 源文件描述 Niagara 特效，DreamFX 插件把它们编译成标准的 UNiagaraSystem、UNiagaraEmitter 与 UNiagaraScript；反过来，任何现有 Niagara 系统都能反编译回源码。文本是唯一的创作面，资产是构建产物，随时可以扔掉重建。',
      primary: '开始阅读',
      secondary: 'GitHub',
      versionsLabel: '当前版本',
      artAlt: 'DreamFX 形象：一位银发术师挥笔画出粒子光轨',
      artCaption: 'DreamFX · Text to UE Niagara',
      scrollCue: '往下看',
    },
    railLabel: '章节导航',
    slides: [
      ['overview', '概览'],
      ['sample', '长什么样'],
      ['workflow', '工作流'],
      ['tools', '工具链'],
      ['docs', '文档'],
    ],
    sample: {
      kicker: '长什么样',
      title: '一个文件，一条命令，一个 Niagara 系统',
      lead: '下面是一份完整的 .dfs —— 不是节选。六个栈里的模块调用、user 参数、renderer 属性，全部是文本；构建把它变成 /Game 下一个普通的 UNiagaraSystem。',
      file: 'NS_Hello.dfs',
      result: '生成 /Game/Effects/NS_Hello，全程不用打开编辑器',
      command: 'pwsh -File Plugins/DreamFX/.skill/dfx.ps1 build DFX/Effects/NS_Hello.dfs',
    },
    versions: [
      ['DreamFX', '1.0.0'],
      ['UE', '5.8'],
      ['诊断码', '143'],
      ['License', 'MIT'],
    ],
    workflow: {
      kicker: '工作流',
      title: '文本进，Niagara 资产出 —— 也能倒着走',
      lead: '生成是 headless 的：一条命令，一个资产。编辑器开着时，存盘即重建，Niagara 预览窗口就是实时预览。反方向同样成立，反编译不是便利导出，是有契约的往返。',
      steps: [
        ['01', 'Source', '.dfs 写系统，.dfe 写可复用 emitter，.dfm 写模块与动态输入。六个固定栈、事件处理器、simulation stage、renderer 属性与绑定，全在文本里。'],
        ['02', 'Build', 'commandlet 解析源码、按模块 → emitter → 系统的顺序生成，跑完 Niagara 编译，并在资产上盖一枚溯源戳：源 hash + 生成器版本 + 模块版本 GUID。'],
        ['03', 'Verify', 'lint → build → verify → corpus 四步 CI。verify 抓的是「改了源码没重建就提交」——只跑 build 永远发现不了，因为 build 会把它修好。'],
        ['04', 'Round-trip', '反编译回 .dfs 逐字节幂等；表达不了的东西逐条写进文件头缺口注释，绝不静默丢。Adopt 接管一个资产前先重导出比对，对不上就拒绝。'],
      ],
    },
    tools: {
      kicker: '工具链',
      title: '插件、命令行、编辑器扩展与 AI 技能',
      lead: '菜单是入口，不是第二套实现：编辑器里点的每个按钮，和命令行跑的是同一条管线，同一批诊断码。',
      items: [
        {
          icon: Puzzle,
          title: 'DreamFX 插件',
          text: '解析、生成、反编译、file watcher、Content Browser 右键、工具栏，以及 -NoDreamFXEditor 一键关闭。',
          href: '/docs/tools/editor',
        },
        {
          icon: CodeXml,
          title: 'dfx.ps1 / ci.ps1',
          text: 'build · verify · lint · decompile · mirror-diff · asset-diff · coverage · schema · index · corpus，关着编辑器全部跑得动。',
          href: '/docs/tools/cli',
        },
        {
          icon: Recycle,
          title: '四层往返验证',
          text: 'L1 文本逐行、L2 镜像编译、L3 SimCache 运行时等价、asset-diff 资产事实走查——绕开导出器自身的盲点。',
          href: '/docs/generation/roundtrip',
        },
        {
          icon: Bot,
          title: 'AI 技能',
          text: '插件自带四个 agent 技能：create / verify / diagnose / decompile，编码代理可以全程 headless 地做特效。',
          href: '/docs/tools/skills',
        },
      ],
    },
    docs: {
      kicker: '文档',
      title: '从这里进入',
      lead: '首页负责快速定位，细节留在文档里。按你现在要做的事挑一个入口。',
      routes: [
        ['快速上手', '确认插件在线，写出第一个 .dfs，跑通「保存即重建」的循环。', '/docs/start/installation'],
        ['语言参考', '.dfs / .dfe / .dfm 三种文件，六个栈，值的四种形态，八条 L 规则。', '/docs/language/overview'],
        ['事件与 Stage', 'OnEvent 事件处理器，具名 simulation stage，以及它们各自的硬限制。', '/docs/language/events-and-stages'],
        ['生成与往返', '构建流水线、溯源戳、反编译、Export 与 Adopt 的区别、双引擎与反射后端。', '/docs/generation/pipeline'],
        ['诊断码', '143 个 DFXnnnn，按流水线阶段分成八族，每条都带成因与修法。', '/docs/diagnostics'],
        ['更新日志', '每个版本覆盖了什么，以及 1.0.0 的已知问题清单。', '/docs/changelog'],
      ],
    },
  },
  en: {
    hero: {
      kicker: 'A Niagara authoring language for Unreal Engine',
      title: ['DreamFX', 'Lang'],
      lead: 'Describe Niagara effects in .dfs / .dfe / .dfm source files. The DreamFX plugin compiles them into standard UNiagaraSystem, UNiagaraEmitter and UNiagaraScript assets — and decompiles any existing Niagara system back into source. The text is the authoring surface; the asset is build output, and can always be thrown away and regenerated.',
      primary: 'Read the docs',
      secondary: 'GitHub',
      versionsLabel: 'Current versions',
      artAlt: 'The DreamFX character: a silver-haired mage drawing a trail of particles with a brush',
      artCaption: 'DreamFX · Text to UE Niagara',
      scrollCue: 'Scroll',
    },
    railLabel: 'Section navigation',
    slides: [
      ['overview', 'Overview'],
      ['sample', 'The source'],
      ['workflow', 'Workflow'],
      ['tools', 'Tooling'],
      ['docs', 'Docs'],
    ],
    sample: {
      kicker: 'What it looks like',
      title: 'One file, one command, one Niagara system',
      lead: 'A complete .dfs, not an excerpt. Module calls across the stacks, a user parameter, renderer properties — all of it text, and the build turns it into an ordinary UNiagaraSystem under /Game.',
      file: 'NS_Hello.dfs',
      result: 'builds /Game/Effects/NS_Hello — no editor required',
      command: 'pwsh -File Plugins/DreamFX/.skill/dfx.ps1 build DFX/Effects/NS_Hello.dfs',
    },
    versions: [
      ['DreamFX', '1.0.0'],
      ['UE', '5.8'],
      ['Diagnostics', '143'],
      ['License', 'MIT'],
    ],
    workflow: {
      kicker: 'Workflow',
      title: 'Text in, Niagara assets out — and back again',
      lead: 'Generation is headless: one command, one asset. With the editor open, saving a source rebuilds it, so a Niagara preview window doubles as a live preview. The reverse direction is not a convenience export — it is a contract.',
      steps: [
        ['01', 'Source', '.dfs declares a system, .dfe a reusable emitter, .dfm a module or dynamic input. Six stacks, event handlers, simulation stages, renderer properties and bindings — all of it is text.'],
        ['02', 'Build', 'The commandlet parses, generates modules → emitters → systems, runs the Niagara compile, and stamps provenance on the asset: source hash, generator version, module version GUIDs.'],
        ['03', 'Verify', 'A four-step CI: lint → build → verify → corpus. verify is the one that catches a source edited and committed without a rebuild — build alone can never see it, because build fixes it.'],
        ['04', 'Round-trip', 'Decompilation is byte-for-byte idempotent, and anything the language cannot express is written into the file header as an explicit gap. Adopt re-exports and compares before taking an asset over.'],
      ],
    },
    tools: {
      kicker: 'Tooling',
      title: 'Plugin, command line, editor integration, agent skills',
      lead: 'A menu is an entry point, never a second implementation: every button in the editor runs the same pipeline as the command line, and reports the same diagnostic codes.',
      items: [
        {
          icon: Puzzle,
          title: 'DreamFX plugin',
          text: 'Parser, generator, decompiler, file watcher, Content Browser actions, toolbars — and -NoDreamFXEditor to turn the whole interactive surface off.',
          href: '/docs/tools/editor',
        },
        {
          icon: CodeXml,
          title: 'dfx.ps1 / ci.ps1',
          text: 'build · verify · lint · decompile · mirror-diff · asset-diff · coverage · schema · index · corpus, all runnable with the editor closed.',
          href: '/docs/tools/cli',
        },
        {
          icon: Recycle,
          title: 'Four-layer round trip',
          text: 'L1 text, L2 mirror compile, L3 SimCache runtime equivalence, and asset-diff — reflection-walked facts that route around the exporter itself.',
          href: '/docs/generation/roundtrip',
        },
        {
          icon: Bot,
          title: 'Agent skills',
          text: 'Four skills ship with the plugin: create, verify, diagnose, decompile — a coding agent can author and debug effects headlessly.',
          href: '/docs/tools/skills',
        },
      ],
    },
    docs: {
      kicker: 'Documentation',
      title: 'Enter the docs from here',
      lead: 'The homepage is for orientation; the docs hold the full reference. Pick the entry that matches the task in front of you.',
      routes: [
        ['Getting started', 'Check the plugin is on, write a first .dfs, and learn the save-and-rebuild loop.', '/docs/start/installation'],
        ['Language reference', 'The three file kinds, the six stacks, the four value modes, and the eight L rules.', '/docs/language/overview'],
        ['Events and stages', 'OnEvent handlers, named simulation stages, and the hard limits on each.', '/docs/language/events-and-stages'],
        ['Generation and round trip', 'The build pipeline, provenance, decompilation, Export vs Adopt, engines and backends.', '/docs/generation/pipeline'],
        ['Diagnostics', 'All 143 DFXnnnn codes in eight families, each with its cause and its fix.', '/docs/diagnostics'],
        ['Changelog', 'What each release covers, plus the 1.0.0 known-issue list.', '/docs/changelog'],
      ],
    },
  },
};
