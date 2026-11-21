// take-shots.mjs — serves game/ and takes the 4 real-render screenshots
// listed in shots.json with Playwright + the cached Chromium. Run:
//   node take-shots.mjs
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
const shotsDir = join(here, 'screenshots');
mkdirSync(shotsDir, { recursive: true });

const PORT = 8124;
const server = spawn(process.execPath, ['serve.ts', '--port', String(PORT)], {
  cwd: here, stdio: ['ignore', 'pipe', 'pipe'],
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('server did not start')), 15000);
  server.stdout.on('data', () => { clearTimeout(t); resolve(); });
  server.stderr.on('data', (d) => { process.stderr.write(d); });
});

const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/${shot.query}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const out = join(shotsDir, shot.name);
    await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
    const { size } = await import('node:fs').then((fs) => fs.statSync(out));
    console.log(`${shot.name}: ${size} bytes${size > 262144 ? '  OVER 256 KiB!' : ''}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log('done');
