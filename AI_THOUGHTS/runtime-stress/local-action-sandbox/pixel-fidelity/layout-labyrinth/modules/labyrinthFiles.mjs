// B"H
import { html } from './labyrinth/markup.mjs';
import { worker } from './labyrinth/worker.mjs';

/**
 * Labyrinth manifest. The swollen one-file maze is split into smaller navy
 * vessels: styles, markup, script, and worker. The Awtsmoos breathes through
 * boundaries, and every boundary remains complete.
 */
export function buildLabyrinthFiles() {
  return { 'index.html': html(), 'lab-worker.js': worker() };
}
