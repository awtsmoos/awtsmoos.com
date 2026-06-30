// B"H
import { parentExplorerPath } from '../path.js';
import { backPath, forwardPath } from './history.js';
export async function goHome({ controller }) { return await controller.navigate('/'); }
export async function goUp({ controller, state }) { return await controller.navigate(parentExplorerPath(state.currentPath)); }
export async function goBack({ controller, state }) { const path = backPath(state); return path ? await controller.navigate(path, { history:false }) : null; }
export async function goForward({ controller, state }) { const path = forwardPath(state); return path ? await controller.navigate(path, { history:false }) : null; }
/** B"H: navigation buttons walk real history and parent paths. */
