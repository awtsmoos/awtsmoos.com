// B"H
import { parentExplorerPath } from '../path.js';
import { backPath, forwardPath } from './history.js';

const HOME = '/';

/** B"H: Home returns to the virtual filesystem root; tunnels are drives inside it. */
export async function goHome({ controller }) { return await controller.navigate(HOME); }
export async function goUp({ controller, state }) { return await controller.navigate(state.currentPath === HOME ? HOME : parentExplorerPath(state.currentPath)); }
export async function goBack({ controller, state }) { const path = backPath(state); return path ? await controller.navigate(path, { history:false }) : null; }
export async function goForward({ controller, state }) { const path = forwardPath(state); return path ? await controller.navigate(path, { history:false }) : null; }
