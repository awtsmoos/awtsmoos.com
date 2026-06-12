// B"H

import { renderCrumbs } from "./crumbDom.js";
import { splitAbsolute, splitRelative } from "./splitPaths.js";

/**
 * B"H
 * Chapter 381: Breadcrumbs Became A Small Assembly.
 */
export function renderRelativeCrumbs(container, path, onPick) {
  renderCrumbs(container, splitRelative(path), "/", onPick);
}

export function renderAbsoluteCrumbs(container, path, onPick) {
  renderCrumbs(container, splitAbsolute(path), "›", onPick);
}
