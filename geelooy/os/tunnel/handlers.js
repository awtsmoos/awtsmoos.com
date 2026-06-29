// B"H
import { ACTIONS } from "./actions.js";
import { desktopHandlers } from "./desktopHandlers.js";
import { graphHandlers } from "./graphHandlers.js";
import { vfsHandlers } from "./vfsHandlers.js";

export function createHandlers() {
  return { ...desktopHandlers(), ...graphHandlers(), ...vfsHandlers() };
}

export function unsupported(action) {
  return { ok:false, error:"Unsupported virtual OS action", availableActions:ACTIONS, action };
}

/** B"H: the tunnel handler table is now a gathering of focused shluchim. */
