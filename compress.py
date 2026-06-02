import os
from PIL import Image
import glob

root = r'C:\Users\Ceres\CodeBuddy\20260531125820\assets'
total_before = 0
total_after = 0

for ext in ('*.png', '*.jpg', '*.jpeg'):
    for path in glob.glob(os.path.join(root, '**', ext), recursive=True):
        before = os.path.getsize(path)
        total_before += before
        try:
            img = Image.open(path)
            # 转 RGB（去掉 alpha 通道压缩更小）
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            # 限制最大尺寸
            w, h = img.size
            if max(w, h) > 2000:
                ratio = 2000 / max(w, h)
                img = img.resize((int(w*ratio), int(h*ratio)), Image.LANCZOS)

            # 保存压缩
            if path.lower().endswith('.png'):
                img.save(path, 'PNG', optimize=True)
            else:
                img.save(path, 'JPEG', quality=80, optimize=True)

            after = os.path.getsize(path)
            total_after += after
            print(f'{os.path.basename(path)}: {before/1024:.0f}KB -> {after/1024:.0f}KB')
        except Exception as e:
            print(f'{os.path.basename(path)}: SKIP ({e})')

print(f'\nTotal: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB')
