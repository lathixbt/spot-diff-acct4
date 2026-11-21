// scenes.js — the six winter-night scenes of Mountain Cabin Night.
// Each scene paints the ORIGINAL panel; the variant 'B' panel applies that
// scene's differences (removed / recoloured / moved / resized / flipped /
// added) so the two panels stay near-identical but fair. Ring positions:
// pa = where the ring sits on the left panel, pb = on the right panel.
// Panel space is 560 x 360. Everything is deterministic (no Math.random).

import {
  sky, stars, moon, aurora, snowGround, mountain, pine, cabin, smoke,
  lantern, snowman, fence, woodpile, pathSnow, footprints, icicles, rock, flag,
} from './draw.js';

const W = 560, H = 360;

// --- shared backdrops -------------------------------------------------------

function baseNight(ctx, seed, starCount, auroraOn) {
  sky(ctx, W, H, '#070d1f', '#16294d');
  stars(ctx, seed, starCount, W, H, 170);
  if (auroraOn) aurora(ctx, W, 46, '#4ade80', 0.20);
}

function lakeIce(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = '#a9c8e8';
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(cx - rx * 0.35, cy - ry * 0.35, rx * 0.4, ry * 0.3, -0.2, 0, Math.PI * 2); ctx.fill();
}

function sled(ctx, x, y, s) {
  ctx.strokeStyle = '#7a3b1e';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s - 6, y - 10, x - s + 8, y - 12); ctx.stroke();
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(x - s * 0.7, y - 12, s * 1.4, 5);
  ctx.fillStyle = '#2c4a6b';
  ctx.fillRect(x - s * 0.5, y - 24, s, 12);
}

function owl(ctx, x, y, s) {
  ctx.fillStyle = '#8a7a68';
  ctx.beginPath(); ctx.ellipse(x, y, s * 0.5, s * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 0.55, s * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.2, y - s * 0.55, s * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 0.55, s * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.2, y - s * 0.55, s * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 0.55, s * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.2, y - s * 0.55, s * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.07, y - s * 0.4); ctx.lineTo(x + s * 0.07, y - s * 0.4); ctx.lineTo(x, y - s * 0.28);
  ctx.closePath(); ctx.fill();
}

function brightStar(ctx, x, y, r) {
  ctx.fillStyle = '#fff8d0';
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.28, y - r * 0.28);
  ctx.lineTo(x + r, y); ctx.lineTo(x + r * 0.28, y + r * 0.28);
  ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.28, y + r * 0.28);
  ctx.lineTo(x - r, y); ctx.lineTo(x - r * 0.28, y - r * 0.28);
  ctx.closePath(); ctx.fill();
}

// --- Scene 1: The Cabin Porch ----------------------------------------------

function paintCabinPorch(ctx, v) {
  baseNight(ctx, 11, 60, true);
  moon(ctx, 470, 58, 26);
  mountain(ctx, 90, 252, 260, 110, '#1b2f52', true);
  mountain(ctx, 470, 252, 300, 90, '#14263f', true);
  snowGround(ctx, W, H, 252);
  pine(ctx, 58, 302, 108, true);
  if (v === 'A') pine(ctx, 500, 312, 92, true); else pine(ctx, 522, 316, 92, true);
  cabin(ctx, 210, 300, 150, '#ffd76a');
  // In B only the LEFT window goes dark (painted over here).
  if (v === 'B') {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(210 - 45 - 12, 207 + 26 - 12, 24, 24);
    ctx.strokeStyle = '#2c1c10'; ctx.lineWidth = 2;
    ctx.strokeRect(210 - 45 - 12, 207 + 26 - 12, 24, 24);
  }
  if (v === 'A') smoke(ctx, 250, 132, 4, 0.85);
  lantern(ctx, 330, 288, 26, v !== 'B');
  snowman(ctx, 420, 312, 42, v === 'B' ? '#7a5230' : '#e8722a');
  pathSnow(ctx, [[210, 300], [225, 322], [245, 345], [262, 360]], 26);
  if (v === 'A') footprints(ctx, [[268, 322, 0.2], [282, 332, -0.15], [296, 342, 0.2], [310, 352, -0.1]]);
  fence(ctx, 430, 330, 110, 4);
  if (v === 'B') brightStar(ctx, 120, 50, 7);
  if (v === 'B') icicles(ctx, 288, 206, 3, 15);
}

// --- Scene 2: The Frozen Lake ----------------------------------------------

function paintFrozenLake(ctx, v) {
  baseNight(ctx, 22, 55, false);
  aurora(ctx, W, 46, v === 'B' ? '#b678e8' : '#4ade80', 0.20);
  moon(ctx, 90, 55, 24);
  mountain(ctx, 130, 250, 300, 120, '#1b2f52', true);
  mountain(ctx, 480, 250, 260, 95, '#14263f', true);
  pine(ctx, 40, 252, 84, true);
  pine(ctx, 96, 254, 64, true);
  if (v === 'B') pine(ctx, 122, 250, 48, true);
  snowGround(ctx, W, H, 246);
  lakeIce(ctx, 280, 302, 250, 52);
  if (v === 'A') {
    ctx.fillStyle = 'rgba(255,246,200,0.5)';
    ctx.fillRect(82, 268, 16, 66);
    ctx.fillStyle = 'rgba(255,246,200,0.28)';
    ctx.fillRect(66, 282, 48, 8);
  }
  // fishing hole (+ rod)
  const hx = v === 'B' ? 400 : 360;
  ctx.fillStyle = '#0d1b2e';
  ctx.beginPath(); ctx.ellipse(hx, 302, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(hx + 14, 300); ctx.lineTo(hx + 42, 262); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,240,240,0.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(hx + 42, 262); ctx.lineTo(hx + 30, 296); ctx.stroke();
  sled(ctx, 150, 318, v === 'B' ? 30 : 20);
  lantern(ctx, v === 'B' ? 420 : 452, 292, 24, true);
  // one explicit star, removable in B
  if (v === 'A') brightStar(ctx, 300, 40, 6);
  if (v === 'B') {
    ctx.strokeStyle = 'rgba(230,240,255,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(228, 300); ctx.lineTo(252, 312); ctx.lineTo(244, 322); ctx.lineTo(268, 314);
    ctx.stroke();
  }
  cabin(ctx, 486, 246, 62, '#ffd76a');
}

// --- Scene 3: The Pine Forest Path ------------------------------------------

function paintForestPath(ctx, v) {
  baseNight(ctx, 33, 70, false);
  moon(ctx, 500, 50, v === 'B' ? 13 : 20);
  pine(ctx, 60, 340, 150, true);
  if (v === 'A') pine(ctx, 140, 295, 95, true); else pine(ctx, 160, 300, 95, true);
  pine(ctx, 500, 340, 140, true);
  pine(ctx, 440, 300, 100, true);
  if (v === 'B') pine(ctx, 280, 196, 52, true);
  snowGround(ctx, W, H, 250);
  pathSnow(ctx, [[280, 250], [276, 290], [286, 330], [280, 360]], 34);
  if (v === 'B') pathSnow(ctx, [[282, 312], [320, 330], [348, 344]], 16);
  if (v === 'A') footprints(ctx, [[272, 292, 0.1], [288, 306, -0.2], [276, 322, 0.15], [290, 338, -0.1], [280, 352, 0.1]]);
  if (v === 'A') owl(ctx, 140, 176, 26);
  lantern(ctx, 196, 262, 22, v !== 'B');
  lantern(ctx, 372, 268, 22, true);
  rock(ctx, 420, 322, 16, v === 'B' ? '#7a5230' : '#8b97a8');
  snowman(ctx, 330, 252, 26, '#e8722a');
  if (v === 'B') brightStar(ctx, 200, 40, 7);
}

// --- Scene 4: The Aurora Ridge ----------------------------------------------

function paintAuroraRidge(ctx, v) {
  baseNight(ctx, 44, 80, true);
  if (v === 'A') aurora(ctx, W, 96, '#7fe0a8', 0.24);
  moon(ctx, v === 'B' ? 110 : 80, v === 'B' ? 70 : 60, 20);
  mountain(ctx, 120, 268, 300, 170, '#1b2f52', true);
  mountain(ctx, 280, 268, 340, 210, '#22395e', v !== 'B');
  mountain(ctx, 470, 268, 260, 140, '#14263f', true);
  snowGround(ctx, W, H, 266);
  cabin(ctx, 280, 296, 92, '#ffd76a');
  // In B only the LEFT window turns green.
  if (v === 'B') {
    ctx.fillStyle = '#7fe0a8';
    ctx.fillRect(252 - 7, 255 - 7, 14, 14);
    ctx.strokeStyle = '#2c1c10'; ctx.lineWidth = 2;
    ctx.strokeRect(252 - 7, 255 - 7, 14, 14);
  }
  if (v === 'A') smoke(ctx, 306, 226, 3, 0.8);
  pine(ctx, 60, 330, 110, true);
  pine(ctx, 420, 332, 100, true);
  if (v === 'B') pine(ctx, 482, 316, 64, true);
  if (v === 'B') brightStar(ctx, 150, 45, 7);
  if (v === 'B') rock(ctx, 180, 338, 18, '#8b97a8');
}

// --- Scene 5: The Woodpile Shed ---------------------------------------------

function paintWoodpileShed(ctx, v) {
  baseNight(ctx, 55, 55, false);
  moon(ctx, 90, 52, 22);
  pine(ctx, 60, 300, 120, true);
  if (v === 'B') pine(ctx, 502, 236, 70, true);
  snowGround(ctx, W, H, 248);
  // shed: open front, posts + roof
  const sx = 200, sy = 250, sw = 190, sh = 96;
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(sx, sy - sh, 10, sh);
  ctx.fillRect(sx + sw - 10, sy - sh, 10, sh);
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.moveTo(sx - 14, sy - sh);
  ctx.lineTo(sx + sw / 2, sy - sh - 52);
  ctx.lineTo(sx + sw + 14, sy - sh);
  ctx.closePath();
  ctx.fill();
  if (v !== 'B') {
    ctx.fillStyle = '#eef4fb';
    ctx.beginPath();
    ctx.moveTo(sx - 14, sy - sh);
    ctx.lineTo(sx + sw / 2, sy - sh - 52);
    ctx.lineTo(sx + sw + 14, sy - sh);
    ctx.lineTo(sx + sw + 8, sy - sh + 6);
    ctx.lineTo(sx + sw / 2, sy - sh - 40);
    ctx.lineTo(sx - 8, sy - sh + 6);
    ctx.closePath();
    ctx.fill();
  }
  if (v === 'B') icicles(ctx, 300, sy - sh - 6, 3, 13);
  woodpile(ctx, sx + 24, sy - 6, 4, 6, 15);
  if (v === 'B') woodpile(ctx, sx + 24, sy - 6 - 4 * 15 * 0.9, 1, 5, 15);
  // axe in stump
  if (v === 'A') {
    ctx.fillStyle = '#6b4a3a';
    ctx.beginPath(); ctx.ellipse(150, 322, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(150 - 18, 306, 36, 10);
    ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(158, 308); ctx.lineTo(172, 272); ctx.stroke();
    ctx.fillStyle = '#9aa5b1';
    ctx.beginPath(); ctx.moveTo(172, 272); ctx.lineTo(186, 280); ctx.lineTo(172, 288); ctx.closePath(); ctx.fill();
  }
  // saw leaning on the shed
  ctx.strokeStyle = v === 'B' ? '#3b6ea5' : '#c0392b';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(420, 268); ctx.lineTo(436, 306); ctx.stroke();
  ctx.fillStyle = '#c8ccd2';
  ctx.fillRect(414, 300, 30, 10);
  lantern(ctx, 380, 218, 22, v !== 'B');
  // bucket
  const bx = v === 'B' ? 230 : 200;
  ctx.fillStyle = '#5a6b7a';
  ctx.beginPath();
  ctx.moveTo(bx - 12, 322); ctx.lineTo(bx + 12, 322); ctx.lineTo(bx + 9, 340); ctx.lineTo(bx - 9, 340);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#eef4fb';
  ctx.beginPath(); ctx.ellipse(bx, 322, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  fence(ctx, 420, 336, 120, 4);
  if (v === 'B') brightStar(ctx, 90, 45, 6);
}

// --- Scene 6: The Moonlit Summit --------------------------------------------

function paintMoonlitSummit(ctx, v) {
  baseNight(ctx, 66, 70, false);
  if (v === 'B') aurora(ctx, W, 60, '#4ade80', 0.2);
  moon(ctx, 280, 88, 40);
  if (v === 'A') {
    ctx.fillStyle = 'rgba(190,170,120,0.55)';
    ctx.beginPath(); ctx.arc(268, 82, 5, 0, Math.PI * 2); ctx.fill();
  }
  if (v === 'A') brightStar(ctx, 450, 40, 6);
  mountain(ctx, 130, 300, 320, 190, '#1b2f52', true);
  mountain(ctx, 280, 300, 380, 250, '#22395e', true);
  mountain(ctx, 450, 300, 300, 170, '#14263f', true);
  snowGround(ctx, W, H, 298);
  flag(ctx, 280, 66, 46, v === 'B' ? '#3b6ea5' : '#c0392b');
  if (v === 'A') pine(ctx, 90, 330, 110, true); else pine(ctx, 112, 334, 110, true);
  pine(ctx, 470, 332, 96, true);
  pine(ctx, 410, 336, 70, true);
  // skis stuck in the snow
  if (v === 'A') {
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(172, 322); ctx.lineTo(188, 292); ctx.stroke();
    ctx.strokeStyle = '#2c4a6b';
    ctx.beginPath(); ctx.moveTo(188, 322); ctx.lineTo(204, 292); ctx.stroke();
  }
  if (v === 'B') {
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(380, 322, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a3b1e';
    ctx.fillRect(372, 306, 16, 8);
  }
  if (v === 'A') footprints(ctx, [[268, 318, 0.1], [284, 330, -0.15], [296, 342, 0.1], [308, 352, -0.1]]);
  rock(ctx, 200, 344, 14, '#8b97a8');
}

// --- scene table -------------------------------------------------------------

export const SCENES = [
  {
    id: 'porch', name: 'The Cabin Porch', par: 150,
    diffs: [
      { x: 330, y: 262, r: 18, kind: 'recoloured', note: 'lantern light' },
      { x: 252, y: 110, r: 22, kind: 'removed', note: 'chimney smoke' },
      { x: 428, y: 268, r: 10, kind: 'recoloured', note: 'snowman nose' },
      { x: 120, y: 50, r: 9, kind: 'added', note: 'bright star' },
      { x: 500, y: 268, x2: 522, y2: 272, r: 30, kind: 'moved', note: 'right pine' },
      { x: 165, y: 233, r: 14, kind: 'recoloured', note: 'left window' },
      { x: 300, y: 212, r: 12, kind: 'added', note: 'icicles' },
      { x: 282, y: 334, r: 16, kind: 'removed', note: 'footprints' },
    ],
    paint: paintCabinPorch,
  },
  {
    id: 'lake', name: 'The Frozen Lake', par: 150,
    diffs: [
      { x: 90, y: 300, r: 20, kind: 'removed', note: 'moon reflection' },
      { x: 360, y: 302, x2: 400, y2: 300, r: 15, kind: 'moved', note: 'fishing hole' },
      { x: 280, y: 62, r: 30, kind: 'recoloured', note: 'aurora band' },
      { x: 122, y: 226, r: 16, kind: 'added', note: 'shore pine' },
      { x: 150, y: 312, r: 18, kind: 'resized', note: 'sled' },
      { x: 300, y: 40, r: 9, kind: 'removed', note: 'bright star' },
      { x: 250, y: 312, r: 18, kind: 'added', note: 'ice crack' },
      { x: 452, y: 276, x2: 420, y2: 276, r: 16, kind: 'moved', note: 'ice lantern' },
    ],
    paint: paintFrozenLake,
  },
  {
    id: 'forest', name: 'The Pine Forest Path', par: 165,
    diffs: [
      { x: 140, y: 176, r: 16, kind: 'removed', note: 'owl' },
      { x: 196, y: 250, r: 14, kind: 'recoloured', note: 'path lantern' },
      { x: 280, y: 176, r: 18, kind: 'added', note: 'distant pine' },
      { x: 282, y: 320, r: 16, kind: 'removed', note: 'footprints' },
      { x: 500, y: 50, r: 20, kind: 'resized', note: 'moon' },
      { x: 312, y: 326, r: 16, kind: 'added', note: 'path fork' },
      { x: 420, y: 322, r: 14, kind: 'recoloured', note: 'rock' },
      { x: 200, y: 40, r: 9, kind: 'added', note: 'bright star' },
      { x: 140, y: 258, x2: 160, y2: 262, r: 30, kind: 'moved', note: 'left pine' },
    ],
    paint: paintForestPath,
  },
  {
    id: 'ridge', name: 'The Aurora Ridge', par: 150,
    diffs: [
      { x: 400, y: 92, r: 26, kind: 'removed', note: 'aurora band' },
      { x: 280, y: 95, r: 24, kind: 'removed', note: 'snowcap' },
      { x: 252, y: 255, r: 12, kind: 'recoloured', note: 'cabin window' },
      { x: 482, y: 292, r: 16, kind: 'added', note: 'ridge pine' },
      { x: 150, y: 45, r: 10, kind: 'added', note: 'bright star' },
      { x: 306, y: 214, r: 16, kind: 'removed', note: 'chimney smoke' },
      { x: 80, y: 60, x2: 110, y2: 70, r: 20, kind: 'moved', note: 'moon' },
      { x: 180, y: 338, r: 14, kind: 'added', note: 'foreground rock' },
    ],
    paint: paintAuroraRidge,
  },
  {
    id: 'shed', name: 'The Woodpile Shed', par: 165,
    diffs: [
      { x: 150, y: 300, r: 16, kind: 'removed', note: 'axe' },
      { x: 380, y: 206, r: 14, kind: 'recoloured', note: 'shed lantern' },
      { x: 254, y: 192, r: 18, kind: 'added', note: 'top log row' },
      { x: 200, y: 330, x2: 230, y2: 332, r: 14, kind: 'moved', note: 'bucket' },
      { x: 428, y: 286, r: 12, kind: 'recoloured', note: 'saw handle' },
      { x: 310, y: 152, r: 14, kind: 'added', note: 'icicles' },
      { x: 90, y: 45, r: 9, kind: 'added', note: 'bright star' },
      { x: 295, y: 130, r: 22, kind: 'removed', note: 'roof snow' },
      { x: 502, y: 212, r: 16, kind: 'added', note: 'back pine' },
    ],
    paint: paintWoodpileShed,
  },
  {
    id: 'summit', name: 'The Moonlit Summit', par: 150,
    diffs: [
      { x: 292, y: 32, r: 14, kind: 'recoloured', note: 'summit flag' },
      { x: 182, y: 306, r: 18, kind: 'removed', note: 'skis' },
      { x: 380, y: 318, r: 16, kind: 'added', note: 'backpack' },
      { x: 268, y: 82, r: 10, kind: 'removed', note: 'moon crater' },
      { x: 90, y: 296, x2: 112, y2: 300, r: 30, kind: 'moved', note: 'slope pine' },
      { x: 420, y: 62, r: 26, kind: 'added', note: 'aurora band' },
      { x: 284, y: 334, r: 16, kind: 'removed', note: 'footprints' },
      { x: 450, y: 40, r: 9, kind: 'removed', note: 'bright star' },
    ],
    paint: paintMoonlitSummit,
  },
];

export const PANEL_W = W;
export const PANEL_H = H;
export const TOTAL_DIFFS = SCENES.reduce((n, s) => n + s.diffs.length, 0);
