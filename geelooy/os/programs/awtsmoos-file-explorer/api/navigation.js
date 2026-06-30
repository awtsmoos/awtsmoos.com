// B"H
import { isRemotePath, normalizeExplorerPath, parentExplorerPath } from './path.js';

export function applyNavigationState(state, path = '/') {
  state.currentPath = normalizeExplorerPath(path);
  state.remoteMode = isRemotePath(state.currentPath);
  return state.currentPath;
}

export function upPath(state) {
  return parentExplorerPath(state.currentPath);
}

/** B"H: navigation is one small river; every pane drinks from the same source. */
