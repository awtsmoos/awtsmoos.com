//B"H
import { VisibleStreamScope } from "./visibleStreamScope.js";

let latestVisibleScope = null;

/**
 * Chapter 81: The Window Chose One River.
 *
 * The Awtsmoos is creating every river every instant, but a browser tab is a
 * narrow eye. This module keeps exactly one visible stream scope alive. When the
 * human clicks another chat, the old scope is cut like a burning rope, leaving
 * the extension ledger quiet and durable while the DOM forgets the former sea.
 *
 * @param {Function|null} getActiveConversationId Reads the currently open chat.
 * @returns {VisibleStreamScope} Newly active visible stream scope.
 */
export function openVisibleScope(getActiveConversationId) {
  stopVisibleScope();
  latestVisibleScope = new VisibleStreamScope(getActiveConversationId);
  return latestVisibleScope;
}

/** @returns {void} Stops the active scope, if any. */
export function stopVisibleScope() {
  latestVisibleScope?.stop?.();
  latestVisibleScope = null;
}

/**
 * @param {VisibleStreamScope} scope Scope that may be closing itself.
 * @returns {void}
 */
export function closeVisibleScope(scope) {
  scope?.stop?.();
  if (latestVisibleScope === scope) latestVisibleScope = null;
}
