import Link from 'next/link';
import type { ReactNode } from 'react';
import { LocaleText } from './locale-text';

export interface GapProps {
  /** The diagnostic that declares the gap, e.g. `DFX8016`. */
  code?: string;
  /** Where that diagnostic is documented. */
  href?: string;
  /** What the round trip cannot carry, and what happens instead. */
  children?: ReactNode;
}

/**
 * Block-level banner for a round-trip gap: something an export cannot express.
 *
 * DreamFX's contract is that a gap is *declared* — written into the exported
 * file's header and reported as a diagnostic — never dropped in silence. This
 * banner is how the docs say that in the same shape every time.
 *
 * ```mdx
 * <Gap code="DFX8016" href="/docs/diagnostics/dfx8xxx#dfx8016">
 *   A stage of a custom C++ stage class …
 * </Gap>
 * ```
 */
export function Gap({ code, href, children }: GapProps) {
  return (
    <div className="dfx-gap" role="note">
      <p className="dfx-gap-head">
        <LocaleText en={<strong>Round-trip gap</strong>} zh={<strong>往返缺口</strong>} />
        {code ? (
          <>
            {' — '}
            {href ? (
              <Link href={href}>
                <code>{code}</code>
              </Link>
            ) : (
              <code>{code}</code>
            )}
          </>
        ) : null}
      </p>
      {children}
    </div>
  );
}
