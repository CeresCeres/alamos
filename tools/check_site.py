"""Check local runtime assets and GitHub file sizes; never delete files.

Run: python tools/check_site.py [--json]
Uses the Python standard library only.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_PATH = re.compile(r"assets/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|svg|woff2?|ttf|json)")


def audit():
    html = (ROOT / "index.html").read_text("utf-8-sig")
    runtime = {"index.html", *re.findall(
        r'(?:src|href)="([^"?#]+\.(?:js|css))(?:\?[^"#]*)?"', html
    )}
    assets = set()
    missing = []
    for name in sorted(runtime - {"media-sizes.js"}):
        path = ROOT / name
        if not path.is_file():
            missing.append(name)
            continue
        assets.update(ASSET_PATH.findall(path.read_text("utf-8-sig")))
    meta = ROOT / "media-sizes.js"
    if meta.is_file():
        previews = json.loads(meta.read_text("utf-8-sig").split(
            "window.ALMS_PREVIEWS = ", 1
        )[1].strip().rstrip(";"))
        for source, variants in previews.items():
            if source in assets:
                assets.update(item["src"] for item in variants)
    else:
        missing.append("media-sizes.js")
    files = {p.relative_to(ROOT).as_posix(): p.stat().st_size
             for p in ROOT.rglob("*") if p.is_file() and ".git" not in p.parts}
    missing.extend(sorted(assets - files.keys()))
    unused = sorted(name for name in files if name.startswith("assets/") and name not in assets)
    oversized = {name: size for name, size in files.items() if size > 25 * 1024 * 1024}
    largest = max(files, key=files.get)
    return dict(runtime=sorted(runtime), assets=sorted(assets), missing=missing,
                unused_assets=unused, oversized_files=oversized, file_count=len(files),
                total_bytes=sum(files.values()), largest_file=largest,
                largest_bytes=files[largest])


if __name__ == "__main__":
    result = audit()
    if "--json" in sys.argv:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['file_count']} files; {result['total_bytes'] / 1048576:.2f} MiB total")
        print(f"Largest: {result['largest_file']} ({result['largest_bytes'] / 1048576:.2f} MiB)")
        print(f"Missing references: {len(result['missing'])}; files over 25 MiB: {len(result['oversized_files'])}")
        print(f"Unreferenced assets: {len(result['unused_assets'])} (review before removing)")
        for name in result['missing']:
            print('MISSING:', name)
        for name in result['oversized_files']:
            print('OVER 25 MiB:', name)
        if result['file_count'] > 100:
            print('Web upload: split into batches of at most 100 files, or use GitHub Desktop.')
    sys.exit(bool(result['missing'] or result['oversized_files']))
