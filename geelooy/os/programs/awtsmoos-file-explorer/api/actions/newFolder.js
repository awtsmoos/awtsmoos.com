// B"H
import { targetPath } from './paths.js';
export async function newFolder({ os, state, name = 'New Folder.folder' }) { return await os.vfs.mkdir(targetPath(state, name), { principal:{ id:'explorer.newFolder' } }); }
/** B"H: New Folder is a VFS mkdir with a named principal. */
