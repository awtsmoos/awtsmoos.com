// B"H
import { selectedPaths } from './paths.js';
import { setClipboard } from './clipboardState.js';
export function copySelected({ os, controller }) { return setClipboard(os, 'copy', selectedPaths(controller)); }
/** B"H: Copy records intent; paste performs the world-change. */
