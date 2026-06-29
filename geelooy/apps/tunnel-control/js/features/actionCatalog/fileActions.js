// B"H
import { action } from './action.js';

/** B"H: local file actions remain the grounded dust under every preview. */
export const FILE_ACTIONS = Object.freeze([
  action('list', 'List files', 'Show directory entries. Auto-preview can return a private /view folder link.', 'Files', ['safe','auto-preview'], { path:'.', autoPreview:true }),
  action('tree', 'Tree view', 'Show a bounded folder tree with optional private preview.', 'Files', ['safe','auto-preview'], { path:'.', needsTree:true, autoPreview:true }),
  action('read', 'Read file', 'Read one file; safe paths return private /view links by default.', 'Files', ['safe','auto-preview'], { path:'README.md', autoPreview:true }),
  action('write', 'Write file', 'Rewrite one complete file.', 'Files', ['advanced'], { path:'notes.txt', needsContent:true })
]);
