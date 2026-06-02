// B"H
/**
 * @file virtualFilesystem.js
 * @brief Tunnel-control facade over the shared Awtsmoos virtual filesystem.
 *
 * @description
 * The tunnel-control runtime mesh, /geelooy/ai, and Code AI Studio now breathe
 * through the same virtual filesystem vessel. Offline writes and reads are no
 * longer trapped in one page's private memory.
 */

import { sharedVirtualFilesystem } from '../../../../../shared/awtsmoos-runtime/index.js';

export function listVirtualFiles(base = '/') {
  return sharedVirtualFilesystem.list(base).map(entry => ({ path: entry.path, type: entry.kind || 'file', bytes: entry.bytes || 0 }));
}

export function readVirtualFile(path) {
  return sharedVirtualFilesystem.read(path);
}

export function writeVirtualFile(path, content) {
  return sharedVirtualFilesystem.write(path, content);
}

export function snapshotVirtualFilesystem() {
  return sharedVirtualFilesystem.snapshot();
}
