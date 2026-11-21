// Mountain Cabin Night — the hand-in program (Node 22, standard library only).
//
// It copies this repository's game/ and screenshots/ into the output directory
// and writes /output/dossier.json with the vendored make.fun library, exactly as
// the competition's rules describe. The output is deterministic: the same files
// in, the same bytes out — no timestamps, no randomness, no network.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The vendored library main.ts imports: it must be in the repository, or the
// grader's run fails before it starts.
if (!existsSync(join(here, 'vendor', 'makefun-game.ts'))) {
  throw new Error('vendor/makefun-game.ts is missing from the repository');
}

// The game itself: plain static files a desktop browser loads offline.
const indexHtml = join(here, 'game', 'index.html');
if (!existsSync(indexHtml) || statSync(indexHtml).size > 1048576) {
  throw new Error('game/index.html is missing or over the 1 MiB cap');
}
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });

// Screenshots: 3 or 4 real renders of the game's own code, the first by name
// the cover. Refuse to hand in a broken set rather than ship it silently.
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.')).sort()
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const name of shots) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  const head = readFileSync(join(shotsDir, name)).subarray(0, 4);
  const isJpeg = head[0] === 0xff && head[1] === 0xd8;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  if (!isJpeg && !isPng) throw new Error(`screenshot ${name} is neither a JPEG nor a PNG`);
}
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The dossier the judge reads: byte for byte what the library writes from the
// files above, with the competition's own caps.
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
if (statSync(dossierPath).size === 0) {
  throw new Error('dossier.json came out empty');
}
