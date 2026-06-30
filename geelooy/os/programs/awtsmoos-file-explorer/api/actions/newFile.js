// B"H
import { targetPath } from './paths.js';
export async function newFile({ os, state, name = 'New File.txt' }) { return await os.vfs.write(targetPath(state, name), defaultContent(name), { principal:{ id:'explorer.newFile' } }); }
function defaultContent(name) { return name.endsWith('.html') ? '<!--B"H-->\n<!doctype html>\n<title>Awtsmoos</title>' : `B"H\nContent of ${name}`; }
/** B"H: New File writes through VFS, not a guessed storage shadow. */
