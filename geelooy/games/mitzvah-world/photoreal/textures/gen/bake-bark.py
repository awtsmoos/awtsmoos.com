#!/usr/bin/env python3
# B"H — Reality Engine texture baker: bark albedo + normal + roughness.
# Plan §32 recipe: base #6b5a4a; worley plates stretched ×(1,6) vertically;
# plate edges darkened (crevice #2e2620); per-plate hash lightening;
# fine grain fbm ±12%. Normal from heightmap via Sobel, strength 1.4.
# Deterministic: fixed seed. Output: textures/baked/bark-{albedo,normal,rough}.png
import numpy as np
from PIL import Image
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'baked')
os.makedirs(OUT, exist_ok=True)

SIZE = 1024
SEED = 0x1BA9

rng = np.random.default_rng(SEED)

# --- value noise via lattice ---
def make_noise(seed):
    r = np.random.default_rng(seed)
    perm = np.arange(256, dtype=np.int32)
    r.shuffle(perm)
    perm = np.tile(perm, 2)
    def noise(x, y):
        # x, y: arrays
        xi = np.floor(x).astype(np.int32) & 255
        yi = np.floor(y).astype(np.int32) & 255
        xf = x - np.floor(x)
        yf = y - np.floor(y)
        u = xf * xf * (3 - 2 * xf)
        v = yf * yf * (3 - 2 * yf)
        # gradient hash
        def g(h, dx, dy):
            h = h & 3
            # vectorized gradient
            gx = np.where((h == 0) | (h == 1), 1, -1) * np.where(h < 2, dx, dy)
            # simpler: use hash-based value
            return ((h * 0.37 + dx * 0.73 + dy * 0.91) % 1) * 2 - 1
        aa = perm[perm[xi] + yi]
        ba = perm[perm[xi + 1] + yi]
        ab = perm[perm[xi] + yi + 1]
        bb = perm[perm[xi + 1] + yi + 1]
        # value noise (not gradient) for simplicity
        a = (aa / 255.0) * 2 - 1
        b = (ba / 255.0) * 2 - 1
        c = (ab / 255.0) * 2 - 1
        d = (bb / 255.0) * 2 - 1
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
    return noise

def fbm(noise, x, y, oct=4):
    v = np.zeros_like(x)
    a, f = 0.5, 1.0
    for _ in range(oct):
        v += a * noise(x * f, y * f)
        f *= 2.03
        a *= 0.5
    return v

# --- worley: precompute feature points ---
CELLS_X, CELLS_Y = 26, 12
pts_x = np.zeros((CELLS_Y, CELLS_X))
pts_y = np.zeros((CELLS_Y, CELLS_X))
for cy in range(CELLS_Y):
    for cx in range(CELLS_X):
        pts_x[cy, cx] = cx + 0.1 + rng.random() * 0.8
        pts_y[cy, cx] = cy + 0.1 + rng.random() * 0.8

def worley(wx, wy):
    # wx, wy: arrays in cell coords. Returns (f1, cell_id)
    cx = np.floor(wx).astype(np.int32)
    cy = np.floor(wy).astype(np.int32)
    f1 = np.full_like(wx, 1e9)
    cid = np.zeros_like(wx, dtype=np.int32)
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            wxc = (cx + ox) % CELLS_X
            wyc = (cy + oy) % CELLS_Y
            px = pts_x[wyc, wxc]
            py = pts_y[wyc, wxc]
            d = (px - wx) ** 2 + (py - wy) ** 2
            mask = d < f1
            f1 = np.where(mask, d, f1)
            cid = np.where(mask, wyc * CELLS_X + wxc, cid)
    return np.sqrt(f1), cid

print("Generating bark maps...")
noise = make_noise(SEED ^ 0x5EED)

# coordinate grids
yy, xx = np.mgrid[0:SIZE, 0:SIZE].astype(np.float64)
# domain warp: distort worley coords with fbm for irregular plates
warp_x = fbm(noise, (xx / SIZE) * 6, (yy / SIZE) * 6, oct=3) * 1.2
warp_y = fbm(noise, (xx / SIZE) * 6 + 9.2, (yy / SIZE) * 6 + 3.7, oct=3) * 1.2
wx = (xx / SIZE) * CELLS_X + warp_x
wy = (yy / SIZE) * CELLS_Y + warp_y * 0.5  # less vertical warp (plates stay tall)

f1, cell_id = worley(wx, wy)
plate = 1 - np.minimum(1, f1 * 1.8)

# per-plate hash lightening (deterministic from cell_id)
cell_rng = (cell_id.astype(np.int64) * 0x9E3779B9) & 0xFFFFFFFF
plate_light = 0.85 + ((cell_rng % 1000) / 1000.0) * 0.3

# fine grain
grain = fbm(noise, (xx / SIZE) * 90, (yy / SIZE) * 14, oct=3)

# height for normals
height = plate * 0.7 + (grain * 0.5 + 0.5) * 0.3

# albedo
base = np.array([0x6b, 0x5a, 0x4a], dtype=np.float64) / 255.0
crev = np.array([0x2e, 0x26, 0x20], dtype=np.float64) / 255.0
crevice_mask = (1 - plate)[..., None]
albedo = base[None, None, :] * (1 - crevice_mask * 0.7) + crev[None, None, :] * crevice_mask * 0.7
albedo *= plate_light[..., None]
albedo *= (1 + grain[..., None] * 0.12)
albedo = np.clip(albedo, 0, 1)

albedo_img = Image.fromarray((albedo * 255).astype(np.uint8), 'RGB')
albedo_img.save(os.path.join(OUT, 'bark-albedo.png'))
print("  bark-albedo.png")

# normal from height via Sobel
strength = 1.4
# wrap for tileability
hp = np.pad(height, 1, mode='wrap')
tl = hp[:-2, :-2]; t = hp[:-2, 1:-1]; tr = hp[:-2, 2:]
l = hp[1:-1, :-2]; r = hp[1:-1, 2:]
bl = hp[2:, :-2]; b = hp[2:, 1:-1]; br = hp[2:, 2:]
dx = (tr + 2 * r + br - tl - 2 * l - bl) * strength
dy = (bl + 2 * b + br - tl - 2 * t - tr) * strength
inv = 1.0 / np.sqrt(dx * dx + dy * dy + 1)
nx = -dx * inv
ny = -dy * inv
nz = inv
normal = np.stack([(nx * 0.5 + 0.5), (ny * 0.5 + 0.5), (nz * 0.5 + 0.5)], axis=-1)
normal_img = Image.fromarray((np.clip(normal, 0, 1) * 255).astype(np.uint8), 'RGB')
normal_img.save(os.path.join(OUT, 'bark-normal.png'))
print("  bark-normal.png")

# roughness
rough = 0.95 - height * 0.12
rough_img = Image.fromarray((np.clip(rough, 0, 1) * 255).astype(np.uint8), 'L').convert('RGB')
rough_img.save(os.path.join(OUT, 'bark-rough.png'))
print("  bark-rough.png")
print("Done:", OUT)
