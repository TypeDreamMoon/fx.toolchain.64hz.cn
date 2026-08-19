import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * One screen of the homepage deck. Each band fills the viewport and carries a
 * snap point; the sizing and the wash live in `home.css` keyed off
 * `dfx-section-<id>`, so a band only has to name itself here.
 */
export function HomeSection({
  id,
  children,
}: {
  id: 'sample' | 'workflow' | 'tools' | 'docs';
  children: ReactNode;
}) {
  return (
    <section className={`dfx-section dfx-section-${id}`} id={id}>
      <div className="dfx-container">{children}</div>
    </section>
  );
}

export function SectionHead({
  icon: Icon,
  kicker,
  title,
  lead,
}: {
  icon: LucideIcon;
  kicker: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="dfx-head">
      <p className="dfx-kicker">
        <Icon aria-hidden="true" />
        {kicker}
      </p>
      <h2>{title}</h2>
      <p className="dfx-lead">{lead}</p>
    </header>
  );
}
