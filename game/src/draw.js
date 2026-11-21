// draw.js — small deterministic Canvas 2D helpers for the winter-night scenes.
// Every helper draws with fixed coordinates (or a seeded RNG), so both panels
// and every run render byte-identical art. No images, no network, no Math.random.

// Deterministic RNG (mulberry32) — same seed, same stars, every run.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sky(ctx, W, H, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(0.62, bottom);
  g.addColorStop(1, '#0a1226');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function stars(ctx, seed, n, W, H, maxY) {
  const r = rng(seed);
  ctx.fillStyle = '#e8f0ff';
  for (let i = 0; i < n; i++) {
    const x = 8 + r() * (W - 16);
    const y = 6 + r() * (maxY - 12);
    const s = 0.7 + r() * 1.3;
    ctx.globalAlpha = 0.45 + r() * 0.55;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function moon(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fffbe8');
  g.addColorStop(0.7, '#f4e9c0');
  g.addColorStop(1, '#d9c48f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,170,120,0.5)';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.15, r * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.3, y - r * 0.35, r * 0.09, 0, Math.PI * 2); ctx.fill();
}

export function aurora(ctx, W, y0, hue, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.moveTo(0, y0 + 26);
  ctx.bezierCurveTo(W * 0.2, y0 - 34, W * 0.4, y0 + 18, W * 0.62, y0 - 22);
  ctx.bezierCurveTo(W * 0.8, y0 - 52, W * 0.92, y0 - 6, W, y0 - 30);
  ctx.lineTo(W, y0 + 34);
  ctx.bezierCurveTo(W * 0.75, y0 + 62, W * 0.5, y0 + 30, W * 0.28, y0 + 58);
  ctx.bezierCurveTo(W * 0.12, y0 + 74, 0, y0 + 52, 0, y0 + 26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function snowGround(ctx, W, H, y0) {
  ctx.fillStyle = '#dfe9f5';
  ctx.beginPath();
  ctx.moveTo(0, y0 + 14);
  ctx.quadraticCurveTo(W * 0.25, y0 - 8, W * 0.5, y0 + 6);
  ctx.quadraticCurveTo(W * 0.75, y0 + 18, W, y0 + 4);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.ellipse(W * 0.22, y0 + 26, 90, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W * 0.72, y0 + 44, 110, 12, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function mountain(ctx, x, y, w, h, color, snow) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x, y - h);
  ctx.lineTo(x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  if (snow) {
    ctx.fillStyle = '#eef4fb';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.16, y - h * 0.68);
    ctx.lineTo(x, y - h);
    ctx.lineTo(x + w * 0.16, y - h * 0.68);
    ctx.lineTo(x + w * 0.07, y - h * 0.56);
    ctx.lineTo(x, y - h * 0.64);
    ctx.lineTo(x - w * 0.07, y - h * 0.56);
    ctx.closePath();
    ctx.fill();
  }
}

export function pine(ctx, x, y, s, snowy) {
  // y = base of the tree, s = height
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x - 2.5 * s / 60, y - 10 * s / 60, 5 * s / 60, 10 * s / 60);
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const wy = y - 8 * s / 60 - t * s * 0.82;
    const ww = s * (0.52 - t * 0.3);
    ctx.fillStyle = i === 0 ? '#123c2a' : i === 1 ? '#17503a' : '#1d6448';
    ctx.beginPath();
    ctx.moveTo(x - ww / 2, wy);
    ctx.lineTo(x, wy - s * 0.42);
    ctx.lineTo(x + ww / 2, wy);
    ctx.closePath();
    ctx.fill();
    if (snowy) {
      ctx.fillStyle = 'rgba(238,244,251,0.9)';
      ctx.beginPath();
      ctx.moveTo(x - ww * 0.32, wy - s * 0.1);
      ctx.lineTo(x, wy - s * 0.3);
      ctx.lineTo(x + ww * 0.32, wy - s * 0.1);
      ctx.lineTo(x + ww * 0.16, wy - s * 0.04);
      ctx.lineTo(x, wy - s * 0.12);
      ctx.lineTo(x - ww * 0.16, wy - s * 0.04);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function cabin(ctx, x, y, s, winColor) {
  // x,y = centre of the cabin base; s = width of the cabin body
  const bw = s, bh = s * 0.62;
  const bx = x - bw / 2, by = y - bh;
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 1; i < 5; i++) {
    ctx.fillRect(bx, by + (bh / 5) * i, bw, 2);
  }
  // snowy roof
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.moveTo(bx - s * 0.1, by);
  ctx.lineTo(x, by - s * 0.34);
  ctx.lineTo(bx + bw + s * 0.1, by);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#eef4fb';
  ctx.beginPath();
  ctx.moveTo(bx - s * 0.1, by);
  ctx.lineTo(x, by - s * 0.34);
  ctx.lineTo(bx + bw + s * 0.1, by);
  ctx.lineTo(bx + bw + s * 0.06, by + s * 0.05);
  ctx.lineTo(x, by - s * 0.24);
  ctx.lineTo(bx - s * 0.06, by + s * 0.05);
  ctx.closePath();
  ctx.fill();
  // chimney
  ctx.fillStyle = '#6b4a3a';
  ctx.fillRect(x + bw * 0.24, by - s * 0.42, s * 0.12, s * 0.24);
  ctx.fillStyle = '#eef4fb';
  ctx.fillRect(x + bw * 0.24, by - s * 0.44, s * 0.12, s * 0.05);
  // door
  ctx.fillStyle = '#2c1c10';
  ctx.fillRect(x - s * 0.09, y - s * 0.34, s * 0.18, s * 0.34);
  ctx.fillStyle = '#d8a94e';
  ctx.beginPath(); ctx.arc(x + s * 0.05, y - s * 0.17, 2.5, 0, Math.PI * 2); ctx.fill();
  // windows
  windowLit(ctx, x - bw * 0.3, by + bh * 0.28, s * 0.16, winColor);
  windowLit(ctx, x + bw * 0.28, by + bh * 0.28, s * 0.16, winColor);
}

export function windowLit(ctx, cx, cy, w, color) {
  ctx.fillStyle = '#2c1c10';
  ctx.fillRect(cx - w / 2 - 2, cy - w / 2 - 2, w + 4, w + 4);
  ctx.fillStyle = color;
  ctx.fillRect(cx - w / 2, cy - w / 2, w, w);
  ctx.strokeStyle = '#2c1c10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx + w / 2, cy);
  ctx.moveTo(cx, cy - w / 2); ctx.lineTo(cx, cy + w / 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,180,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.7, cy + w * 0.9, w * 0.9, w * 0.35, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

export function smoke(ctx, x, y, puffs, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(226,232,240,${alpha})`;
  for (let i = 0; i < puffs; i++) {
    const px = x + Math.sin(i * 1.7) * 7 + i * 3;
    const py = y - i * 13;
    const r = 5 + i * 2.4;
    ctx.globalAlpha = alpha * (1 - i / (puffs + 1));
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function lantern(ctx, x, y, s, lit) {
  ctx.strokeStyle = '#1c1410';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - s * 1.5); ctx.lineTo(x, y - s * 0.9); ctx.stroke();
  ctx.fillStyle = '#1c1410';
  ctx.fillRect(x - s * 0.22, y - s * 0.95, s * 0.44, s * 0.1);
  ctx.fillStyle = lit ? '#ffd76a' : '#8a94a6';
  ctx.fillRect(x - s * 0.16, y - s * 0.85, s * 0.32, s * 0.55);
  ctx.fillStyle = '#1c1410';
  ctx.fillRect(x - s * 0.22, y - s * 0.32, s * 0.44, s * 0.08);
  if (lit) {
    ctx.fillStyle = 'rgba(255,215,106,0.22)';
    ctx.beginPath(); ctx.arc(x, y - s * 0.55, s * 0.85, 0, Math.PI * 2); ctx.fill();
  }
}

export function snowman(ctx, x, y, s, noseColor) {
  ctx.fillStyle = '#f4f8fd';
  ctx.beginPath(); ctx.arc(x, y - s * 0.22, s * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - s * 0.68, s * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - s * 1.02, s * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - s * 0.07, y - s * 1.05, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.07, y - s * 1.05, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = noseColor;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.99);
  ctx.lineTo(x + s * 0.26, y - s * 0.96);
  ctx.lineTo(x, y - s * 0.93);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(x - s * 0.24, y - s * 1.22, s * 0.48, s * 0.07);
  ctx.fillRect(x - s * 0.18, y - s * 1.34, s * 0.36, s * 0.13);
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x, y - s * 0.62, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - s * 0.48, 2.4, 0, Math.PI * 2); ctx.fill();
}

export function fence(ctx, x, y, w, posts) {
  ctx.strokeStyle = '#4a2f1d';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + w, y - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + w, y - 26); ctx.stroke();
  ctx.fillStyle = '#5a3a22';
  for (let i = 0; i <= posts; i++) {
    const px = x + (w / posts) * i;
    ctx.fillRect(px - 3, y - 34, 6, 34);
  }
  ctx.fillStyle = 'rgba(238,244,251,0.85)';
  ctx.fillRect(x, y - 38, w, 5);
}

export function woodpile(ctx, x, y, rows, cols, logW) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - (r % 2); c++) {
      const lx = x + c * logW + (r % 2) * logW / 2;
      const ly = y - r * logW * 0.9;
      ctx.fillStyle = '#7a5230';
      ctx.beginPath(); ctx.arc(lx, ly, logW / 2 - 1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d9b98c';
      ctx.beginPath(); ctx.arc(lx, ly, logW / 2 - 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a67c52';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(lx, ly, logW / 4, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

export function pathSnow(ctx, pts, width) {
  ctx.strokeStyle = '#c9d8ea';
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

export function footprints(ctx, pts) {
  ctx.fillStyle = 'rgba(160,180,205,0.8)';
  for (const [x, y, a] of pts) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function icicles(ctx, x, y, n, len) {
  ctx.fillStyle = 'rgba(190,220,245,0.9)';
  for (let i = 0; i < n; i++) {
    const ix = x + i * 12;
    const l = len * (0.6 + ((i * 37) % 10) / 22);
    ctx.beginPath();
    ctx.moveTo(ix - 3, y);
    ctx.lineTo(ix + 3, y);
    ctx.lineTo(ix, y + l);
    ctx.closePath();
    ctx.fill();
  }
}

export function rock(ctx, x, y, s, color) {
  ctx.fillStyle = color || '#8b97a8';
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.62, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(238,244,251,0.9)';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.1, y - s * 0.28, s * 0.7, s * 0.22, -0.15, 0, Math.PI * 2);
  ctx.fill();
}

export function flag(ctx, x, y, s, color) {
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.75, y - s * 0.78);
  ctx.lineTo(x, y - s * 0.56);
  ctx.closePath();
  ctx.fill();
}
