// B"H
import { nameOf, selectedPaths, targetPath } from './paths.js';
export async function renameSelected({ os, state, controller, system }) { const [path] = selectedPaths(controller); if (!path) return 0; const next = await system?.prompt?.(`Rename ${nameOf(path)} to:`, nameOf(path)); if (!next || next === nameOf(path)) return 0; await os.vfs.move(path, targetPath(state, next), { principal:{ id:'explorer.rename' } }); return 1; }
/** B"H: Rename asks, then moves through VFS with one honest name. */
