"""Check every /docs link and #anchor in the content against the static export.

Run `npm run build` first — this reads `out/`, so it validates what actually shipped
rather than what the sources look like they meant.

    python scripts/check-links.py

Exit code 1 if anything is unresolved, so it can gate a deploy.
"""

import glob
import io
import os
import re
import sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LINK = re.compile(r"\]\((/docs[^)\s]*)\)")
HREF = re.compile(r'href="(/docs[^"]*)"')


def main():
    os.chdir(SITE)

    if not os.path.isdir("out"):
        raise SystemExit("no out/ — run `npm run build` first")

    routes = set()
    for path in glob.glob("out/**/index.html", recursive=True):
        rel = os.path.dirname(path).replace(os.sep, "/")[len("out"):]
        routes.add("/" + rel.strip("/"))

    anchors = {}
    broken = []

    for path in glob.glob("content/docs/**/*.mdx", recursive=True):
        text = io.open(path, encoding="utf-8").read()
        for target in LINK.findall(text) + HREF.findall(text):
            route, _, fragment = target.partition("#")
            route = route.rstrip("/")
            if route not in routes:
                broken.append((path, target))
            elif fragment:
                anchors.setdefault(route, []).append((path, target, fragment))

    for path, target in broken:
        print("missing route: %s -> %s" % (path, target))

    missing_anchors = 0
    for route, uses in anchors.items():
        html_path = os.path.join("out", route.strip("/"), "index.html")
        if not os.path.exists(html_path):
            continue
        ids = set(
            re.findall(
                r'id="([^"]+)"',
                io.open(html_path, encoding="utf-8", errors="ignore").read(),
            )
        )
        for path, target, fragment in uses:
            if fragment not in ids:
                missing_anchors += 1
                print("missing anchor: %s -> %s" % (path, target))

    print(
        "%d routes exported, %d broken links, %d missing anchors"
        % (len(routes), len(broken), missing_anchors)
    )

    return 1 if broken or missing_anchors else 0


if __name__ == "__main__":
    sys.exit(main())
