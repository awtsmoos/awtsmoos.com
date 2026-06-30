// B"H

/** Wire the overlay's large navigation gates. */
export function bindOverlay(world, dom, actions) {
  dom.start.onclick = () => actions.primary();
  dom.restart.onclick = () => actions.restart();
}

/** Render overlay copy so win/loss/ready are impossible to confuse. */
export function renderOverlay(world, dom) {
  dom.overlay.classList.toggle('hidden', world.mode === 'playing');
  if (world.mode === 'won') return won(world, dom);
  if (world.mode === 'lost') return lost(world, dom);
  ready(world, dom);
}

function ready(world, dom) {
  dom.title.textContent = 'Nitzotz.io Worlds';
  dom.text.textContent = `Enter ${world.level.name}. Eat smaller sparks, dodge giants, pulse through the crush.`;
  dom.start.textContent = 'BEGIN';
}

function won(world, dom) {
  dom.title.textContent = `${world.level.name} Revealed`; 
  dom.text.textContent = 'The gate opened. Hit the huge button or press N for the next world.';
  dom.start.textContent = 'NEXT WORLD';
}

function lost(world, dom) {
  dom.title.textContent = 'Try Again';
  dom.text.textContent = 'The giants punished the rush. Restart and grow before colliding.';
  dom.start.textContent = 'RETRY';
}
