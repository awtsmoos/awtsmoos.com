// B"H
import { importFiles } from '/os/helpers/scripts.js';
export async function importIntoCurrent({ os, state }) { return await importFiles({ os, path:state.currentPath }); }
/** B"H: Import remains browser-backed but now sits inside action law. */
