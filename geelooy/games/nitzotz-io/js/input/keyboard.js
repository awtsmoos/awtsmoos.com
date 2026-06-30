// B"H

/** Keyboard control: direct, obvious, and kind to both arrows and WASD. */
export function bindKeyboard(world, actions) {
  const keys = new Set();
  addEventListener('keydown', event => keyDown(event, keys, world, actions));
  addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  return () => pollKeys(keys, world);
}

function keyDown(event, keys, world, actions) {
  keys.add(event.key.toLowerCase());
  if (event.code === 'Space') actions.pulse();
  if (event.key === 'Enter') actions.primary();
  if (event.key.toLowerCase() === 'r') actions.restart();
  if (event.key.toLowerCase() === 'n' && world.mode === 'won') actions.nextWorld();
}

function pollKeys(keys, world) {
  const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  const y = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
  world.input.x = x;
  world.input.y = y;
}
