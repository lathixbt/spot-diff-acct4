// playtest.mjs — drives the real game in Chromium and checks every mechanic:
// click a difference, wrong click, hint, pause, keyboard Enter, scene clear,
// full win. Prints PASS/FAIL per check. Run: node playtest.mjs
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = 8125;
const server = spawn(process.execPath, ['serve.ts', '--port', String(PORT)], {
  cwd: here, stdio: ['ignore', 'pipe', 'pipe'],
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('server did not start')), 15000);
  server.stdout.on('data', () => { clearTimeout(t); resolve(); });
  server.stderr.on('data', (d) => { process.stderr.write(d); });
});

const results = [];
function check(name, ok, extra) {
  results.push([name, ok]);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra !== undefined ? ' — ' + extra : ''}`);
}

const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  const extReqs = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1')) extReqs.push(r.url()); });

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const hud = async () => ({
    toFind: await page.textContent('#to-find'),
    strikes: await page.textContent('#strikes'),
    score: await page.textContent('#score'),
    streak: await page.textContent('#streak'),
  });

  // 1. initial state: scene 1, 8 to find
  let h = await hud();
  check('initial counter 8 to find', h.toFind === '8 to find', h.toFind);

  // panel geometry: canvases are 560x360 displayed; find bounding boxes
  const box = await page.evaluate(() => {
    const r = document.getElementById('panel-left').getBoundingClientRect();
    const r2 = document.getElementById('panel-right').getBoundingClientRect();
    return { left: { x: r.x, y: r.y, w: r.width, h: r.height }, right: { x: r2.x, y: r2.y, w: r2.width, h: r2.height } };
  });
  const toPx = (panel, px, py) => {
    const b = panel === 0 ? box.left : box.right;
    return { x: b.x + (px / 560) * b.w, y: b.y + (py / 360) * b.h };
  };

  // 2. click a real difference on the LEFT panel (lantern, scene 1 diff 0 at 330,272)
  let p = toPx(0, 330, 272);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  h = await hud();
  check('click diff -> counter 8 to 7', h.toFind === '7 to find', h.toFind);
  check('click diff -> score > 0', /Score [1-9]/.test(h.score), h.score);
  check('click diff -> streak x1', h.streak === 'Streak ×1', h.streak);

  // 3. wrong click (empty sky on right panel)
  p = toPx(1, 60, 40);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(300);
  h = await hud();
  check('wrong click -> 1 strike', h.strikes.includes('✕'), h.strikes);
  check('wrong click -> streak reset', h.streak === 'Streak ×0', h.streak);

  // 4. hint key H
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  h = await hud();
  check('H hint -> hints 3 to 2', (await page.textContent('#hint-btn')) === 'Hint (2)');

  // 5. pause key P, then resume
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  check('P pause -> overlay shown', await page.isVisible('#overlay .card'));
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  check('P resume -> overlay hidden', await page.evaluate(() => document.getElementById('overlay').classList.contains('hidden')));

  // 6. keyboard: move crosshair with arrows, Enter guesses at a difference.
  // Move crosshair to the smoke difference (252,110) on the left panel:
  // crosshair starts at panel 0 centre (280,180); step 8px (Shift=24).
  await page.keyboard.press('ArrowLeft'); // 272
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft'); // ~240
  for (let i = 0; i < 9; i++) await page.keyboard.press('ArrowUp'); // ~108
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  h = await hud();
  check('keyboard Enter -> finds smoke diff (6 to find)', h.toFind === '6 to find', h.toFind);

  // 7. finish scene 1 by clicking the remaining 6 diffs (right panel, B coords)
  const rest = [
    [428, 268, 1], [120, 50, 1], [522, 272, 1], [165, 233, 1], [300, 212, 1], [282, 334, 1],
  ];
  for (const [x, y, panel] of rest) {
    p = toPx(panel, x, y);
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(400);
  check('scene clear -> overlay shown', await page.isVisible('#overlay .card'));
  check('scene clear -> overlay mentions Scene clear', (await page.textContent('#overlay')).includes('Scene clear'));

  // 8. next scene via N key
  await page.keyboard.press('n');
  await page.waitForTimeout(400);
  check('N -> scene 2 (The Frozen Lake)', (await page.textContent('#scene-name')) === 'The Frozen Lake');
  h = await hud();
  check('scene 2 -> 8 to find', h.toFind === '8 to find', h.toFind);

  // 9. full win: load ?win=1 on a fresh page
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page2.goto(`http://127.0.0.1:${PORT}/?scene=5&win=1`, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(600);
  check('win screen -> overlay shown', await page2.isVisible('#overlay .card'));
  check('win screen -> mentions Night complete', (await page2.textContent('#overlay')).includes('Night complete'));
  check('win screen -> 50/50 found', (await page2.textContent('#overlay')).includes('50/50'));

  // 10. no errors, no external requests
  check('0 page/console errors', errors.length === 0, errors.join(' | ') || 'none');
  check('0 external network requests', extReqs.length === 0, extReqs.join(', ') || 'none');
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter(([, ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
