// B"H
import { selectedPaths } from './paths.js';
export async function removeSelected({ os, controller }) { const paths = selectedPaths(controller); for (const path of paths) await os.vfs.remove(path, { principal:{ id:'explorer.delete' } }); return paths.length; }
/** B"H: Delete removes selected vessels only through the VFS gate. */
