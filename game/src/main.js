// main.js — boots Mountain Cabin Night: builds the scene buttons and
// hands the page over to the game state in game.js.
import { SCENES } from './scenes.js';
import { createGame } from './game.js';

const bar = document.getElementById('scene-bar');
SCENES.forEach((sc, i) => {
  const b = document.createElement('button');
  b.className = 'scene-btn';
  b.dataset.scene = String(i);
  b.textContent = `${i + 1} · ${sc.name}`;
  bar.appendChild(b);
});

createGame();
