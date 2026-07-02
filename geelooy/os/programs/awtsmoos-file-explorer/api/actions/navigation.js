// B"H
import { parentExplorerPath } from '../path.js';
import { backPath, forwardPath } from './history.js';

const HOME = 'awtsmoos://tunnels';

/** B"H: Home means the live tunnel gate, not a silent local database. */
export async function goHome({ controller }) {
  return await controller.navigate(HOME);
}

export async function goUp({ controller, state }) {
  const path = state.currentPath === HOME ? HOME : parentExplorerPath(state.currentPath);
  return await controller.navigate(path);
}

export async function goBack({ controller, state }) {
  const path = backPath(state);
  return path ? await controller.navigate(path, { history:false }) : null;
}

export async function goForward({ controller, state }) {
  const path = forwardPath(state);
  return path ? await controller.navigate(path, { history:false }) : null;
}
