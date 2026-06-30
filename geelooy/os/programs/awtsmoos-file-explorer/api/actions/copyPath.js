// B"H
import { selectedPaths } from './paths.js';
export async function copyPath({ controller }) { const text = selectedPaths(controller).join('\n') || controller.state.currentPath; await navigator.clipboard?.writeText(text); return text; }
/** B"H: Copy Path turns selected roads into clipboard light. */
