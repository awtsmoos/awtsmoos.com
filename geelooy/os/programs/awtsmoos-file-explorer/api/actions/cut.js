// B"H
import { selectedPaths } from './paths.js';
import { setClipboard } from './clipboardState.js';
export function cutSelected({ os, controller }) { return setClipboard(os, 'cut', selectedPaths(controller)); }
/** B"H: Cut is clipboard covenant until paste completes. */
