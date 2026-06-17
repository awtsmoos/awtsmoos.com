// B"H
export function mobileSafeAreaTuning(doc = globalThis.document) { const root = doc?.documentElement; if (!root) return false; root.style.setProperty("--awt-safe-top", "env(safe-area-inset-top,0px)"); root.style.setProperty("--awt-safe-bottom", "env(safe-area-inset-bottom,0px)"); root.style.setProperty("--awt-mobile-control-bottom", "calc(16px + env(safe-area-inset-bottom,0px))"); return true; }
export default mobileSafeAreaTuning;
