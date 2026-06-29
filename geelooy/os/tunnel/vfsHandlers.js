// B"H
import { ok } from "./response.js";
import { currentOs } from "./osAccess.js";

export function vfsHandlers() {
  return {
    vfsList:async p => ok("vfsList", { items:await os().vfs?.list?.(p.path || p.p || "/") }),
    vfsRead:async p => ok("vfsRead", { result:await os().vfs?.read?.(p.path || p.p || "/") }),
    drives:() => ok("drives", { drives:os().drives?.list?.() || [] })
  };
}

function os() { return currentOs(); }
/** B"H: VFS tunnel handlers hold paths, drives, and mounted rivers. */
