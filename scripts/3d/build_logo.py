# Blender script. Turns the flat SUL wordmark into an inflated 3D chrome logo.
#   blender -b -P scripts/3d/build_logo.py
# Writes assets/3d/sul-logo.bin (mesh for the site) and assets/3d/sul-logo.svg (the vector mark).
# scripts/3d/capture_poster.cjs then photographs the live scene for the poster.
import bpy, json, math, os, sys
import numpy as np
from mathutils import geometry, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets/images/sul-wordmark.png')
SCALE = 3            # alpha upsample before tracing
ROUND = 30.0         # inflation radius in source pixels
MELT = 5.0           # blur radius that melts the ridge along each stroke
GRID = 7.0           # interior vertex spacing in source pixels

# ---- load alpha
img = bpy.data.images.load(SRC)
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
alpha = px[:, :, 3]  # row 0 is the bottom of the image

# ---- upsample + soften pixel stairs
def box(a, r):
    k = np.ones(2 * r + 1) / (2 * r + 1)
    a = np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 1, a)
big = np.kron(alpha, np.ones((SCALE, SCALE), dtype=np.float32))
big = box(box(big, 2), 2)
pad = 6
big = np.pad(big, pad)
GH, GW = big.shape

# ---- marching squares
def trace(f, t=0.5):
    segs = {}
    fx = f - t
    for y in range(GH - 1):
        row0, row1 = fx[y], fx[y + 1]
        idx = np.nonzero(((row0[:-1] > 0) * 1 + (row0[1:] > 0) * 2 + (row1[1:] > 0) * 4 + (row1[:-1] > 0) * 8) % 15)[0]
        for x in idx:
            a, b, c, d = row0[x], row0[x + 1], row1[x + 1], row1[x]
            code = (a > 0) * 1 + (b > 0) * 2 + (c > 0) * 4 + (d > 0) * 8
            T = (x + a / (a - b), y) if (a > 0) != (b > 0) else None
            R = (x + 1, y + b / (b - c)) if (b > 0) != (c > 0) else None
            B = (x + d / (d - c), y + 1) if (c > 0) != (d > 0) else None
            L = (x, y + a / (a - d)) if (a > 0) != (d > 0) else None
            pairs = {1: [(L, T)], 2: [(T, R)], 3: [(L, R)], 4: [(R, B)], 5: [(L, T), (R, B)], 6: [(T, B)], 7: [(L, B)],
                     8: [(B, L)], 9: [(B, T)], 10: [(T, R), (B, L)], 11: [(B, R)], 12: [(R, L)], 13: [(R, T)], 14: [(T, L)]}[int(code)]
            for p, q in pairs:
                segs[(round(p[0], 4), round(p[1], 4))] = (round(q[0], 4), round(q[1], 4))
    loops = []
    while segs:
        start, nxt = next(iter(segs.items()))
        del segs[start]
        loop = [start]
        cur = nxt
        while cur in segs:
            loop.append(cur)
            cur = segs.pop(cur)
        if len(loop) > 60:
            loops.append(np.array(loop, dtype=np.float64))
    return loops

raw = trace(big)
raw = [(l - pad) / SCALE for l in raw]  # back to source pixel space

def area(l):
    x, y = l[:, 0], l[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)

# ---- corner-preserving smooth, then resample by arc length
def refine(l, step=1.1):
    n = len(l)
    win = 7
    a = l - np.roll(l, win, axis=0)
    b = np.roll(l, -win, axis=0) - l
    ang = np.abs(np.arctan2(a[:, 0] * b[:, 1] - a[:, 1] * b[:, 0], np.sum(a * b, axis=1)))
    # local maxima above 40 degrees are corners
    corners = [i for i in range(n) if ang[i] > math.radians(40) and ang[i] == max(ang[(i + k) % n] for k in range(-win, win + 1))]
    pts = l.copy()
    pin = np.zeros(n, dtype=bool)
    for c in corners:
        pin[c] = True
    for _ in range(26):
        s = (np.roll(pts, 1, axis=0) + 2 * pts + np.roll(pts, -1, axis=0)) / 4
        pts = np.where(pin[:, None], pts, s)
    seg = np.linalg.norm(np.roll(pts, -1, axis=0) - pts, axis=1)
    out, acc, keep = [], 0.0, []
    for i in range(n):
        if pin[i] or acc >= step:
            out.append(pts[i]); acc = 0.0
        acc += seg[i]
    return np.array(out)

loops = [refine(l) for l in raw if abs(area(l)) > 60]
loops.sort(key=lambda l: -abs(area(l)))
print('LOOPS', [(len(l), round(area(l))) for l in loops])

# Center + normalize: longest side of the mark = 4 scene units
allp = np.vstack(loops)
mn, mx = allp.min(0), allp.max(0)
center = (mn + mx) / 2
k = 4.0 / (mx - mn).max()
print('BOUNDS', mn, mx)

# ---- point-in-polygon + distance to outline (numpy)
segA = np.vstack(loops)
segB = np.vstack([np.roll(l, -1, axis=0) for l in loops])
def dist(q):
    q = np.asarray(q)
    d = segB - segA
    out = np.zeros(len(q))
    for i in range(0, len(q), 256):
        c = q[i:i + 256][:, None, :]
        t = np.clip(np.sum((c - segA) * d, axis=2) / np.maximum(np.sum(d * d, axis=1), 1e-9), 0, 1)
        out[i:i + 256] = np.sqrt(np.sum((c - (segA + t[:, :, None] * d)) ** 2, axis=2)).min(1)
    return out
def inside(q):
    q = np.asarray(q)
    res = np.zeros(len(q), dtype=bool)
    x, y = q[:, 0][:, None], q[:, 1][:, None]
    ax, ay, bx, by = segA[:, 0], segA[:, 1], segB[:, 0], segB[:, 1]
    cond = (ay > y) != (by > y)
    xi = ax + (y - ay) / np.where(by - ay == 0, 1e-9, by - ay) * (bx - ax)
    return ((cond & (x < xi)).sum(1) % 2) == 1

# ---- smooth distance field on a half-pixel grid (mesh shape and shading normals both read from it)
CELL = 0.5
fx0, fy0 = mn[0] - 3, mn[1] - 3
FW, FH = int((mx[0] - mn[0] + 6) / CELL), int((mx[1] - mn[1] + 6) / CELL)
fxs = fx0 + np.arange(FW) * CELL
fys = fy0 + np.arange(FH) * CELL
GXX, GYY = np.meshgrid(fxs, fys)
ix = np.clip(((GXX * SCALE) + pad).astype(int), 0, GW - 1)
iy = np.clip(((GYY * SCALE) + pad).astype(int), 0, GH - 1)
mask = big[iy, ix] > 0.5
coarseA = np.vstack([l[::3] for l in loops])
coarseB = np.vstack([np.roll(l[::3], -1, axis=0) for l in loops])
def dist_coarse(q):
    d = coarseB - coarseA
    out = np.zeros(len(q))
    for i in range(0, len(q), 2048):
        c = q[i:i + 2048][:, None, :]
        t = np.clip(np.sum((c - coarseA) * d, axis=2) / np.maximum(np.sum(d * d, axis=1), 1e-9), 0, 1)
        out[i:i + 2048] = np.sqrt(np.sum((c - (coarseA + t[:, :, None] * d)) ** 2, axis=2)).min(1)
    return out
cells = np.stack([GXX[mask], GYY[mask]], axis=1)
Draw = np.zeros((FH, FW))
Draw[mask] = dist_coarse(cells)
def fastbox(a, r, axis):
    c = np.cumsum(np.insert(a, 0, 0, axis=axis), axis=axis)
    n = a.shape[axis]
    lo = np.clip(np.arange(n) - r, 0, n)
    hi = np.clip(np.arange(n) + r + 1, 0, n)
    w = (hi - lo).astype(float)
    if axis == 0:
        return (c[hi, :] - c[lo, :]) / w[:, None]
    return (c[:, hi] - c[:, lo]) / w[None, :]
def blur(a, r, n=3):
    for _ in range(n):
        a = fastbox(fastbox(a, r, 0), r, 1)
    return a
soft = blur(Draw, int(MELT / CELL))
t = np.clip((Draw - 1.5) / (ROUND * 0.55), 0, 1); t = t * t * (3 - 2 * t)
Dfield = Draw * (1 - t) + soft * t
def prof(D):  # circular shoulder: height and slope
    D = np.minimum(D, ROUND - 1e-3)
    h = np.sqrt(np.maximum(ROUND ** 2 - (ROUND - D) ** 2, 1e-6))
    return h, (ROUND - D) / h
Gy, Gx = np.gradient(Dfield, CELL)
def sample(field, x, y):
    fx = np.clip((x - fx0) / CELL, 0, FW - 1.001); fy = np.clip((y - fy0) / CELL, 0, FH - 1.001)
    i, j = fx.astype(int), fy.astype(int); u, v = fx - i, fy - j
    return field[j, i] * (1 - u) * (1 - v) + field[j, i + 1] * u * (1 - v) + field[j + 1, i] * (1 - u) * v + field[j + 1, i + 1] * u * v

# ---- vertices: outline (decimated), inward offset rings, interior hex grid
def rdp(p, eps):
    if len(p) < 3: return p
    a, b = p[0], p[-1]
    ab = b - a; L = np.hypot(*ab) or 1e-9
    dd = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / L
    i = int(dd.argmax())
    if dd[i] > eps:
        return np.vstack([rdp(p[:i + 1], eps)[:-1], rdp(p[i:], eps)])
    return np.vstack([a, b])
def rdp_closed(l, eps):
    i = int(np.linalg.norm(l - l[0], axis=1).argmax())
    return np.vstack([rdp(l[:i + 1], eps)[:-1], rdp(np.vstack([l[i:], l[:1]]), eps)[:-1]])
points, edges, outN = [], [], []
for l in loops:
    d = rdp_closed(l, 0.09)
    s = len(points)
    points += [tuple(p) for p in d]
    edges += [(s + i, s + (i + 1) % len(d)) for i in range(len(d))]
    tt = np.roll(d, -1, axis=0) - np.roll(d, 1, axis=0)
    tt /= np.maximum(np.linalg.norm(tt, axis=1, keepdims=True), 1e-9)
    sign = 1 if area(l) > 0 else -1
    outN += [(a[1] * sign, -a[0] * sign) for a in tt]  # outward
outline = np.array(points)
outN = np.array(outN)
ringspec = [1.4, 3.6, 7.2, 12.0]
rings = []
for l in loops:
    tt = np.roll(l, -1, axis=0) - np.roll(l, 1, axis=0)
    tt /= np.maximum(np.linalg.norm(tt, axis=1, keepdims=True), 1e-9)
    sign = 1 if area(l) > 0 else -1
    nrm = np.stack([-tt[:, 1], tt[:, 0]], axis=1) * sign
    for j, r in enumerate(ringspec):
        stride = [2, 3, 5, 7][j]
        c = l[::stride] + nrm[::stride] * r
        c = c[sample(Draw, c[:, 0], c[:, 1]) > r * 0.9]
        rings.append(c)
rings = np.vstack(rings)
xs = np.arange(mn[0], mx[0], GRID); ys = np.arange(mn[1], mx[1], GRID * 0.866)
gx = np.array([(x + (j % 2) * GRID / 2, y) for j, y in enumerate(ys) for x in xs])
gx = gx[sample(Draw, gx[:, 0], gx[:, 1]) > ringspec[-1] + GRID * 0.75]
allv = np.vstack([outline, rings, gx])
res = geometry.delaunay_2d_cdt([Vector(p) for p in allv], edges, [], 1, 1e-4)
V = np.array([[v.x, v.y] for v in res[0]])
Fc = res[2]
print('CDT verts', len(V), 'tris', len(Fc), 'outline', len(outline))

# ---- heights and analytic normals
De = sample(Dfield, V[:, 0], V[:, 1])
Dr = sample(Draw, V[:, 0], V[:, 1])
kd = {tuple(np.round(p, 3)): i for i, p in enumerate(outline)}
isout = np.array([tuple(np.round(p, 3)) in kd for p in V])
De[isout] = 0
h, slope = prof(De)
h[isout] = 0
gx_ = sample(Gx, V[:, 0], V[:, 1]); gy_ = sample(Gy, V[:, 0], V[:, 1])
N = np.stack([-slope * gx_, -slope * gy_, np.ones(len(V))], axis=1)
for i in np.nonzero(isout)[0]:
    o = outN[kd[tuple(np.round(V[i], 3))]]
    N[i] = (o[0], o[1], 0)
N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
P = np.stack([(V[:, 0] - center[0]) * k, (V[:, 1] - center[1]) * k, h * k], axis=1)
F = np.array([tuple(f) for f in Fc], dtype=np.int64)
# make every triangle face +z
e1 = P[F[:, 1]] - P[F[:, 0]]; e2 = P[F[:, 2]] - P[F[:, 0]]
flip = (e1[:, 0] * e2[:, 1] - e1[:, 1] * e2[:, 0]) < 0
F[flip] = F[flip][:, [0, 2, 1]]

# ---- compact binary for the site (front half only; the page mirrors it)
import struct
bounds = np.abs(P).max(0)
header = struct.pack('<4sII3f', b'SUL1', len(P), len(F), *bounds)
pos16 = np.round(P / bounds * 32767).astype(np.int16)
nor8 = np.round(N * 127).astype(np.int8)
with open(os.path.join(ROOT, 'assets/3d/sul-logo.bin'), 'wb') as fh:
    fh.write(header)
    fh.write(pos16.tobytes())
    fh.write(nor8.tobytes())
    if len(nor8.tobytes()) % 2: fh.write(b'\0')
    fh.write(F.astype(np.uint16).tobytes())
print('BIN bytes', os.path.getsize(os.path.join(ROOT, 'assets/3d/sul-logo.bin')), 'bounds', bounds)

# ---- outlines for inline SVG (y flipped to screen space, in source pixels)
paths = []
for l in loops:
    s = rdp_closed(l, 0.08)
    s = np.stack([s[:, 0] - mn[0], (mx[1] - mn[1]) - (s[:, 1] - mn[1])], axis=1)
    paths.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in s) + 'Z')
svg_w, svg_h = round(float(mx[0] - mn[0]), 1), round(float(mx[1] - mn[1]), 1)
with open(os.path.join(ROOT, 'assets/3d/sul-logo.svg'), 'w') as fh:
    fh.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}"><path fill="#fff" d="{"".join(paths)}"/></svg>\n')
print('DONE')
