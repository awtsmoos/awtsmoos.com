// B"H
import { html } from './scene/markup.mjs';
import { worker } from './scene/worker.mjs';

/**
 * Runtime file manifest: the Awtsmoos no longer hides a whole city in one file.
 * The page is assembled from navy modules for style, markup, script, and worker.
 * @returns {Record<string,string>} virtual files for Mekrava.
 */
export function buildRuntimeFiles() {
  return { 'index.html': html(), 'mega-worker.js': worker() };
}
