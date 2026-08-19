/**
 * The custom MDX component set for the docs.
 *
 * Everything exported here is registered globally in `mdx-components.tsx`, so content never writes
 * an import line. The components carry structure and class names only — the look lives in the
 * stylesheet under `.dfx-*`.
 */

export { D, Diag } from './diag';
export type { DiagProps, DProps } from './diag';

export { Deprecated } from './deprecated';
export type { DeprecatedProps } from './deprecated';

export { Dfx, Sev } from './dfx-code';
export type { DfxProps, Severity, SevProps } from './dfx-code';

export { Gap } from './gap';
export type { GapProps } from './gap';

export { Grammar } from './grammar';

export { Since } from './since';
export type { SinceProps } from './since';

export { Synopsis } from './synopsis';
export type { SynopsisProps } from './synopsis';

export { Wide } from './wide';
export type { WideProps } from './wide';
