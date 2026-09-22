"""Bundle the readable CSS modules; standard Python only, no npm/build service."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
files=sorted((ROOT/'styles').glob('*.css'))
assert files, 'No CSS modules found'
output='/* Generated from styles/*.css. Edit those modules, then run tools/build_styles.py. */\n\n'
output+='\n\n'.join(p.read_text(encoding='utf-8') for p in files)
(ROOT/'site.css').write_text(output,encoding='utf-8')
print(f'Built site.css from {len(files)} modules.')
