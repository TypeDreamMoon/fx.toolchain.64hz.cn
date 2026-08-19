import { Fragment, type ReactNode } from 'react';
import { LocaleText } from './locale-text';

export type Severity = 'error' | 'warning' | 'info';

export interface DfxProps {
  /** Severity as the compiler reports it. */
  sev: Severity;
  /**
   * The message format string, verbatim from the source. `%s`, `%d`, `%c` and
   * `%04X` are runtime substitutions and are de-emphasised, never rewritten —
   * a reader matching a log line has to see the same spelling.
   */
  msg: string;
  /** Comma-separated `Module/File.cpp:line` sites that raise it. */
  raised?: string;
}

const SEVERITY_LABEL: Record<Severity, { zh: string; en: string }> = {
  error: { zh: '错误', en: 'error' },
  warning: { zh: '警告', en: 'warning' },
  info: { zh: '提示', en: 'info' },
};

/** Splits the format string into plain runs and printf-placeholder runs. */
function renderMessage(msg: string): ReactNode {
  return msg.split(/(%[0-9]*[a-zA-Z]|\{[^{}]*\})/g).map((part, index) => {
    if (part.length === 0) {
      return null;
    }

    if (part.startsWith('%') || (part.startsWith('{') && part.endsWith('}'))) {
      return (
        <span className="dfx-ph" key={index}>
          {part}
        </span>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

/**
 * The generated half of one diagnostic: severity, the verbatim message, and
 * where it is raised from. Written under a `## DFXnnnn` heading so the code
 * itself carries the anchor and the table of contents entry.
 *
 * ```mdx
 * ## DFX1001
 *
 * <Dfx sev="error" msg={"Unterminated string literal."} raised="Parser/DreamFXLexer.cpp:304" />
 * ```
 */
export function Dfx({ sev, msg, raised }: DfxProps) {
  const label = SEVERITY_LABEL[sev] ?? SEVERITY_LABEL.error;

  return (
    <div className="dfx-entry">
      <p className="dfx-entry-head">
        <span className={`dfx-sev dfx-sev-${sev}`}>
          <LocaleText en={label.en} zh={label.zh} />
        </span>
        {raised ? (
          <span className="dfx-entry-raised">
            <LocaleText en="raised by" zh="抛出位置" />
            {raised.split(',').map((site) => (
              <code key={site.trim()}>{site.trim()}</code>
            ))}
          </span>
        ) : null}
      </p>

      <p className="dfx-entry-msg">{renderMessage(msg)}</p>
    </div>
  );
}

export interface SevProps {
  children?: ReactNode;
  /** Severity to colour the pill with. */
  s: Severity;
}

/** Inline severity pill, for tables and prose. */
export function Sev({ s, children }: SevProps) {
  const label = SEVERITY_LABEL[s] ?? SEVERITY_LABEL.error;

  return (
    <span className={`dfx-sev dfx-sev-${s}`}>
      {children ?? <LocaleText en={label.en} zh={label.zh} />}
    </span>
  );
}
