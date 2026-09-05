import collections
from PIL import Image
import numpy as np
from pathlib import Path

def process_image(path):
    if not path.exists():
        return
    img = Image.open(path).convert('RGB')
    w, h = img.size
    arr = np.array(img).astype(float)
    dist = np.linalg.norm(arr - 255.0, axis=2)

    bg_mask = np.zeros((h, w), dtype=bool)
    queue = collections.deque()

    for x in range(w):
        for y in (0, h - 1):
            if dist[y, x] < 65 and not bg_mask[y, x]:
                bg_mask[y, x] = True
                queue.append((x, y))

    for y in range(h):
        for x in (0, w - 1):
            if dist[y, x] < 65 and not bg_mask[y, x]:
                bg_mask[y, x] = True
                queue.append((x, y))

    while queue:
        cx, cy = queue.popleft()
        for dx, dy in ((-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not bg_mask[ny, nx]:
                if dist[ny, nx] < 65:
                    bg_mask[ny, nx] = True
                    queue.append((nx, ny))

    out = np.zeros((h, w, 4), dtype=np.uint8)
    alpha = np.ones((h, w), dtype=float) * 255.0

    for y in range(h):
        for x in range(w):
            if bg_mask[y, x]:
                d = dist[y, x]
                if d <= 5.0:
                    a = 0.0
                elif d < 60.0:
                    a = 255.0 * ((d - 5.0) / 55.0)
                else:
                    a = 255.0
                alpha[y, x] = a

    norm_alpha = alpha / 255.0
    mask_semi = (norm_alpha > 0) & (norm_alpha < 1)
    out_rgb = arr.copy()
    for c in range(3):
        unblended = (arr[:, :, c] - (1.0 - norm_alpha) * 255.0) / np.maximum(norm_alpha, 0.001)
        out_rgb[:, :, c] = np.where(mask_semi, np.clip(unblended, 0, 255), arr[:, :, c])

    out[:, :, :3] = out_rgb.astype(np.uint8)
    out[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

    res = Image.fromarray(out, 'RGBA')
    res.save(path, 'PNG')
    print(f'Processed background removal for {path}')

if __name__ == '__main__':
    files = [Path('logo.png'), Path('renderer/logo.png'), Path('build/icon.png'), Path('logo_transparent.png')]
    for file_path in files:
        process_image(file_path)

