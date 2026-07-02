// B"H
import { isRemotePath, normalizeExplorerPath, parentExplorerPath, pathProvider } from "./path.js";

export function applyNavigationState(state, path = "/") {
  state.currentPath = normalizeExplorerPath(path);
  state.providerMode = pathProvider(state.currentPath);
  state.remoteMode = isRemotePath(state.currentPath);
  return state.currentPath;
}

export function upPath(state) { return parentExplorerPath(state.currentPath); }

/** B"H: the pane remembers provider-mode; remoteMode survives only as a bridge. */
