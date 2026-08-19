import { localizedPath, type Locale } from '@/lib/i18n';
import { GITHUB_URL } from '@/lib/site';
import { BookOpen, ChevronDown, CodeXml, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { Character } from './character';
import type { HomeCopy } from './copy';
import { Particles } from './particles';

export function HeroSection({
  copy,
  locale,
}: {
  copy: HomeCopy;
  locale: Locale;
}) {
  return (
    <section className="dfx-hero" id="overview">
      <div className="dfx-aurora" aria-hidden="true" />
      <Particles />

      <div className="dfx-container dfx-hero-grid">
        <div className="dfx-hero-copy">
          <p className="dfx-kicker">
            <CodeXml aria-hidden="true" />
            {copy.hero.kicker}
          </p>

          <h1>
            {copy.hero.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="dfx-lead">{copy.hero.lead}</p>

          <div className="dfx-actions">
            <Link className="dfx-btn dfx-btn-primary" href={localizedPath(locale, '/docs')}>
              <BookOpen aria-hidden="true" />
              {copy.hero.primary}
            </Link>
            <a
              className="dfx-btn dfx-btn-ghost"
              href={GITHUB_URL}
              rel="noreferrer"
              target="_blank"
            >
              <GitBranch aria-hidden="true" />
              {copy.hero.secondary}
            </a>
          </div>

          <ul className="dfx-tags" aria-label={copy.hero.versionsLabel}>
            {copy.versions.map(([label, value]) => (
              <li key={label}>
                <strong>{label}</strong>
                {value}
              </li>
            ))}
          </ul>
        </div>

        <div className="dfx-hero-art">
          <Character alt={copy.hero.artAlt} caption={copy.hero.artCaption} />
        </div>
      </div>

      <a className="dfx-cue" href="#sample">
        {copy.hero.scrollCue}
        <ChevronDown aria-hidden="true" />
      </a>
    </section>
  );
}
