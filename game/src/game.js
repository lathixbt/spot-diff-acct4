// game.js — state, input, HUD and rendering for Mountain Cabin Night.
// Two canvases (left = original, right = changed) are drawn from the same
// scene paint function with variant 'A' / 'B'. Found differences get a gold
// ring on BOTH panels (the latest find in green); wrong clicks cost a strike.

import { SCENES, PANEL_W, PANEL_H, TOTAL_DIFFS } from './scenes.js';
import { playFind, playWrong, playHint, playClear, playWin, playClick, setMuted, isMuted } from './sound.js';

export const BEST_KEY = 'mountain-cabin-night-best-v1';

const $ = (id) => document.getElementById(id);

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function createGame() {
  const state = {
    sceneIdx: 0,
    found: new Set(),
    strikes: 0,
    hintsLeft: 3,
    score: 0,
    streak: 0,
    bestStreak: 0,
    elapsed: 0,
    running: false,
    paused: false,
    cleared: false,
    won: false,
    totalFound: 0,
    totalScore: 0,
    sceneStart: 0,
    hintFlash: null, // {x, y, until}
    wrongFlash: null, // {x, y, panel, until}
    cross: { x: PANEL_W / 2, y: PANEL_H / 2, panel: 0, visible: false },
    magnify: false,
    mouse: { x: -1, y: -1, panel: -1 },
    lastFind: -1,
  };

  const left = $('panel-left');
  const right = $('panel-right');
  const lctx = left.getContext('2d');
  const rctx = right.getContext('2d');
  left.width = PANEL_W; left.height = PANEL_H;
  right.width = PANEL_W; right.height = PANEL_H;

  const scene = () => SCENES[state.sceneIdx];
  const remaining = () => scene().diffs.length - state.found.size;

  function best() { return loadBest(); }

  function drawPanels() {
    const sc = scene();
    sc.paint(lctx, 'A');
    sc.paint(rctx, 'B');
    // found rings on both panels
    for (const idx of state.found) {
      const d = sc.diffs[idx];
      ring(lctx, d.x, d.y, d.r, idx === state.lastFind);
      ring(rctx, d.x2 !== undefined ? d.x2 : d.x, d.y2 !== undefined ? d.y2 : d.y, d.r, idx === state.lastFind);
    }
    // hint flash
    if (state.hintFlash && Date.now() < state.hintFlash.until) {
      const d = sc.diffs[state.hintFlash.idx];
      const pulse = 1 + 0.12 * Math.sin(Date.now() / 90);
      ringPulse(lctx, d.x, d.y, d.r * pulse);
      ringPulse(rctx, d.x2 !== undefined ? d.x2 : d.x, d.y2 !== undefined ? d.y2 : d.y, d.r * pulse);
    }
    // wrong-click flash
    if (state.wrongFlash && Date.now() < state.wrongFlash.until) {
      const c = state.wrongFlash.panel === 0 ? lctx : rctx;
      c.save();
      c.strokeStyle = '#ff4d4d';
      c.lineWidth = 4;
      const { x, y } = state.wrongFlash;
      c.beginPath();
      c.moveTo(x - 12, y - 12); c.lineTo(x + 12, y + 12);
      c.moveTo(x + 12, y - 12); c.lineTo(x - 12, y + 12);
      c.stroke();
      c.restore();
    }
    // crosshair (keyboard play)
    if (state.cross.visible) {
      const c = state.cross.panel === 0 ? lctx : rctx;
      const { x, y } = state.cross;
      c.save();
      c.strokeStyle = '#ffd76a';
      c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, 14, 0, Math.PI * 2); c.stroke();
      c.beginPath();
      c.moveTo(x - 20, y); c.lineTo(x - 8, y);
      c.moveTo(x + 8, y); c.lineTo(x + 20, y);
      c.moveTo(x, y - 20); c.lineTo(x, y - 8);
      c.moveTo(x, y + 8); c.lineTo(x, y + 20);
      c.stroke();
      c.restore();
    }
    // magnifier lens follows the mouse when enabled
    if (state.magnify && state.mouse.panel >= 0 && state.mouse.x >= 0) {
      drawLens(state.mouse.panel === 0 ? lctx : rctx, state.mouse.x, state.mouse.y);
    }
  }

  function ring(c, x, y, r, latest) {
    c.save();
    c.strokeStyle = latest ? '#3ddc84' : '#f5c542';
    c.lineWidth = 4;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.45)';
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y, r + 3, 0, Math.PI * 2); c.stroke();
    c.fillStyle = latest ? '#3ddc84' : '#f5c542';
    c.beginPath(); c.arc(x + r * 0.7, y - r * 0.7, 4, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function ringPulse(c, x, y, r) {
    c.save();
    c.strokeStyle = '#7fe0ff';
    c.lineWidth = 4;
    c.setLineDash([8, 6]);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    c.restore();
  }

  function drawLens(c, mx, my) {
    const R = 64, Z = 2;
    const src = c === lctx ? left : right;
    c.save();
    c.beginPath(); c.arc(mx, my, R, 0, Math.PI * 2); c.clip();
    c.imageSmoothingEnabled = false;
    c.drawImage(src, mx - R / Z, my - R / Z, (2 * R) / Z, (2 * R) / Z, mx - R, my - R, 2 * R, 2 * R);
    c.strokeStyle = '#ffd76a';
    c.lineWidth = 3;
    c.beginPath(); c.arc(mx, my, R, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,215,106,0.8)';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(mx - 8, my); c.lineTo(mx + 8, my); c.stroke();
    c.beginPath(); c.moveTo(mx, my - 8); c.lineTo(mx, my + 8); c.stroke();
    c.restore();
  }

  function updateHud() {
    const sc = scene();
    $('scene-name').textContent = sc.name;
    $('scene-count').textContent = `Scene ${state.sceneIdx + 1} of ${SCENES.length} · Par ${fmtTime(sc.par)}`;
    $('to-find').textContent = `${remaining()} to find`;
    $('timer').textContent = fmtTime(state.elapsed);
    $('strikes').textContent = '✕'.repeat(state.strikes) + '·'.repeat(Math.max(0, 3 - state.strikes));
    $('hint-btn').textContent = `Hint (${state.hintsLeft})`;
    $('score').textContent = `Score ${state.totalScore + state.score}`;
    $('streak').textContent = `Streak ×${state.streak}`;
    $('found-dots').innerHTML = sc.diffs.map((_, i) =>
      `<span class="dot${state.found.has(i) ? ' found' : ''}"></span>`).join('');
    $('found-label').textContent = `Found: ${state.found.size}/${sc.diffs.length}`;
    const pct = Math.round((state.totalFound / TOTAL_DIFFS) * 100);
    $('progress-fill').style.width = pct + '%';
    $('progress-label').textContent = `${state.totalFound}/${TOTAL_DIFFS} differences · ${pct}%`;
    document.querySelectorAll('.scene-btn').forEach((b, i) => {
      b.classList.toggle('active', i === state.sceneIdx);
      b.classList.toggle('done', i < state.sceneIdx);
    });
    const b = best();
    $('best-line').textContent = b
      ? `Best: ${b.score} pts · ${fmtTime(b.time)} · ${b.found}/${TOTAL_DIFFS} found`
      : 'Best: — play a full night to set one';
  }

  function showOverlay(html) {
    const ov = $('overlay');
    ov.innerHTML = html;
    ov.classList.remove('hidden');
  }

  function hideOverlay() {
    $('overlay').classList.add('hidden');
    $('overlay').innerHTML = '';
  }

  function startScene(idx, presetFound) {
    state.sceneIdx = idx;
    state.found = new Set(presetFound || []);
    state.strikes = 0;
    state.hintsLeft = 3;
    state.score = 0;
    state.streak = 0;
    state.elapsed = 0;
    state.running = true;
    state.paused = false;
    state.cleared = false;
    state.won = false;
    state.lastFind = presetFound && presetFound.length ? presetFound[presetFound.length - 1] : -1;
    state.hintFlash = null;
    state.wrongFlash = null;
    hideOverlay();
    $('pause-btn').textContent = 'Pause';
    drawPanels();
    updateHud();
  }

  function sceneCleared() {
    state.cleared = true;
    state.running = false;
    const timeBonus = Math.max(0, scene().par - state.elapsed) * 5;
    const gained = state.score + timeBonus;
    state.totalScore += gained;
    state.totalFound += state.found.size;
    playClear();
    const last = state.sceneIdx === SCENES.length - 1;
    showOverlay(`
      <div class="card">
        <h2>${last ? 'Last scene clear!' : 'Scene clear!'}</h2>
        <p>${scene().name} — all ${scene().diffs.length} differences found in ${fmtTime(state.elapsed)} (par ${fmtTime(scene().par)}).</p>
        <p>Scene points ${state.score} + time bonus ${timeBonus} = <b>${gained}</b></p>
        <p>Total score: <b>${state.totalScore}</b></p>
        <button id="ov-next">${last ? 'See your night →' : 'Next scene →'}</button>
      </div>`);
    $('ov-next').addEventListener('click', () => {
      playClick();
      if (last) winGame();
      else startScene(state.sceneIdx + 1);
    });
    updateHud();
  }

  function winGame() {
    state.won = true;
    state.running = false;
    playWin();
    const prev = best();
    const entry = { score: state.totalScore, time: state.elapsed, found: state.totalFound };
    const isBest = !prev || state.totalScore > prev.score;
    if (isBest) {
      try { localStorage.setItem(BEST_KEY, JSON.stringify(entry)); } catch { /* private mode */ }
    }
    showOverlay(`
      <div class="card">
        <h2>🌙 Night complete!</h2>
        <p>You found <b>${state.totalFound}/${TOTAL_DIFFS}</b> differences across all 6 scenes.</p>
        <p>Total score: <b>${state.totalScore}</b> · Best streak ×${state.bestStreak}</p>
        <p>${isBest ? '★ New best night!' : ''}</p>
        <button id="ov-again">Play again ↺</button>
      </div>`);
    $('ov-again').addEventListener('click', () => {
      playClick();
      state.totalScore = 0;
      state.totalFound = 0;
      startScene(0);
    });
    updateHud();
  }

  function failScene() {
    state.running = false;
    playWrong();
    showOverlay(`
      <div class="card">
        <h2>Three strikes — the trail goes cold</h2>
        <p>${scene().name}: ${state.found.size}/${scene().diffs.length} found before the third wrong click.</p>
        <p>Score kept: <b>${state.totalScore}</b> · try the scene again.</p>
        <button id="ov-retry">Retry scene ↺</button>
      </div>`);
    $('ov-retry').addEventListener('click', () => {
      playClick();
      startScene(state.sceneIdx);
    });
    updateHud();
  }

  function tryFind(panel, x, y) {
    if (!state.running || state.paused || state.cleared || state.won) return;
    const sc = scene();
    for (let i = 0; i < sc.diffs.length; i++) {
      if (state.found.has(i)) continue;
      const d = sc.diffs[i];
      const cx = panel === 0 ? d.x : (d.x2 !== undefined ? d.x2 : d.x);
      const cy = panel === 0 ? d.y : (d.y2 !== undefined ? d.y2 : d.y);
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= d.r + 4) {
        state.found.add(i);
        state.lastFind = i;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const gained = 100 + (state.streak - 1) * 25;
        state.score += gained;
        playFind();
        drawPanels();
        updateHud();
        if (state.found.size === sc.diffs.length) sceneCleared();
        return;
      }
    }
    // wrong click
    state.strikes += 1;
    state.streak = 0;
    state.wrongFlash = { x, y, panel, until: Date.now() + 700 };
    playWrong();
    drawPanels();
    updateHud();
    if (state.strikes >= 3) failScene();
  }

  function useHint() {
    if (!state.running || state.paused || state.cleared || state.won) return;
    if (state.hintsLeft <= 0) {
      $('hint-btn').classList.add('shake');
      setTimeout(() => $('hint-btn').classList.remove('shake'), 400);
      return;
    }
    const sc = scene();
    const left = sc.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
    if (!left.length) return;
    state.hintsLeft -= 1;
    state.hintFlash = { idx: left[0], until: Date.now() + 2200 };
    playHint();
    drawPanels();
    updateHud();
    setTimeout(() => { state.hintFlash = null; drawPanels(); }, 2300);
  }

  function togglePause() {
    if (!state.running && !state.paused) return;
    state.paused = !state.paused;
    $('pause-btn').textContent = state.paused ? 'Resume' : 'Pause';
    if (state.paused) {
      showOverlay(`
        <div class="card">
          <h2>Paused ❄</h2>
          <p>The snow waits. ${remaining()} differences still hide in ${scene().name}.</p>
          <button id="ov-resume">Resume</button>
        </div>`);
      $('ov-resume').addEventListener('click', togglePause);
    } else {
      hideOverlay();
    }
    drawPanels();
    updateHud();
  }

  // --- events ---------------------------------------------------------------

  function canvasPos(canvas, ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (PANEL_W / r.width),
      y: (ev.clientY - r.top) * (PANEL_H / r.height),
    };
  }

  left.addEventListener('click', (ev) => {
    const p = canvasPos(left, ev);
    tryFind(0, p.x, p.y);
  });
  right.addEventListener('click', (ev) => {
    const p = canvasPos(right, ev);
    tryFind(1, p.x, p.y);
  });

  function trackMouse(canvas, panel) {
    canvas.addEventListener('mousemove', (ev) => {
      const p = canvasPos(canvas, ev);
      state.mouse = { x: p.x, y: p.y, panel };
      if (state.magnify) drawPanels();
    });
    canvas.addEventListener('mouseleave', () => {
      state.mouse = { x: -1, y: -1, panel: -1 };
      if (state.magnify) drawPanels();
    });
  }
  trackMouse(left, 0);
  trackMouse(right, 1);

  $('hint-btn').addEventListener('click', useHint);
  $('pause-btn').addEventListener('click', togglePause);
  $('sound-btn').addEventListener('click', () => {
    setMuted(!isMuted());
    $('sound-btn').textContent = isMuted() ? 'Sound: off' : 'Sound: on';
  });
  $('mag-btn').addEventListener('click', () => {
    state.magnify = !state.magnify;
    $('mag-btn').textContent = state.magnify ? 'Magnifier: on' : 'Magnifier';
    $('mag-btn').classList.toggle('on', state.magnify);
    drawPanels();
  });
  $('restart-btn').addEventListener('click', () => {
    playClick();
    startScene(state.sceneIdx);
  });
  document.querySelectorAll('.scene-btn').forEach((b) => {
    b.addEventListener('click', () => {
      playClick();
      startScene(Number(b.dataset.scene));
    });
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'h' || ev.key === 'H') { useHint(); return; }
    if (ev.key === 'p' || ev.key === 'P') { togglePause(); return; }
    if (ev.key === 'r' || ev.key === 'R') { startScene(state.sceneIdx); return; }
    if (ev.key === 'm' || ev.key === 'M') { $('mag-btn').click(); return; }
    if (ev.key === 'n' || ev.key === 'N') {
      if (state.cleared) $('ov-next') && $('ov-next').click();
      return;
    }
    const step = ev.shiftKey ? 24 : 8;
    const c = state.cross;
    if (ev.key.startsWith('Arrow')) {
      ev.preventDefault();
      c.visible = true;
      if (ev.key === 'ArrowLeft') c.x -= step;
      if (ev.key === 'ArrowRight') c.x += step;
      if (ev.key === 'ArrowUp') c.y -= step;
      if (ev.key === 'ArrowDown') c.y += step;
      if (ev.key === 'ArrowLeft' && c.x < 0 && c.panel === 1) { c.panel = 0; c.x = PANEL_W - 4; }
      if (ev.key === 'ArrowRight' && c.x > PANEL_W && c.panel === 0) { c.panel = 1; c.x = 4; }
      c.x = Math.max(0, Math.min(PANEL_W, c.x));
      c.y = Math.max(0, Math.min(PANEL_H, c.y));
      drawPanels();
      return;
    }
    if (ev.key === 'Enter') {
      c.visible = true;
      tryFind(c.panel, c.x, c.y);
    }
  });

  // timer
  setInterval(() => {
    if (state.running && !state.paused) {
      state.elapsed += 1;
      $('timer').textContent = fmtTime(state.elapsed);
    }
    if (state.hintFlash && Date.now() > state.hintFlash.until) {
      state.hintFlash = null;
      drawPanels();
    }
  }, 1000);

  // URL presets (used by the screenshot script — real renders of the game):
  // ?scene=N&found=a,b,c  — open scene N with those differences already found
  // ?win=1                — show the win screen
  const q = new URLSearchParams(location.search);
  const presetScene = Math.max(0, Math.min(SCENES.length - 1, Number(q.get('scene') || 0)));
  const presetFound = (q.get('found') || '').split(',').filter(Boolean).map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < SCENES[presetScene].diffs.length);
  startScene(presetScene, presetFound);
  if (q.get('win') === '1') {
    state.totalFound = TOTAL_DIFFS;
    state.totalScore = 4850;
    state.bestStreak = 6;
    state.found = new Set(SCENES[presetScene].diffs.map((_, i) => i));
    drawPanels();
    updateHud();
    winGame();
  }
  return state;
}
