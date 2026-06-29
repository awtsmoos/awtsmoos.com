// B"H
import { ok } from "./response.js";
import { currentOs } from "./osAccess.js";

export function vfsHandlers() {
  return {
    vfsList:async p => ok("vfsList", { items:await os().vfs?.list?.(path(p), context(p)) }),
    vfsRead:async p => ok("vfsRead", { result:await os().vfs?.read?.(path(p), context(p)) }),
    vfsWrite:async p => ok("vfsWrite", { result:await os().vfs?.write?.(path(p), p.content ?? "", context(p)) }),
    vfsMkdir:async p => ok("vfsMkdir", { result:await os().vfs?.mkdir?.(path(p), context(p)) }),
    vfsRemove:async p => ok("vfsRemove", { result:await os().vfs?.remove?.(path(p), context(p)) }),
    vfsCan:p => ok("vfsCan", { permission:os().vfs?.can?.(path(p), p.action || "read", context(p)) || null }),
    vfsMounts:() => ok("vfsMounts", { mounts:os().vfs?.mounts?.() || [] }),
    vfsResolve:p => ok("vfsResolve", { resolution:os().vfs?.resolve?.(path(p)) || null, permission:os().vfs?.can?.(path(p), p.action || "read", context(p)) || null }),
    drives:() => ok("drives", { drives:os().drives?.list?.() || [] })
  };
}

function os() { return currentOs(); }
function path(p = {}) { return p.path || p.p || "/"; }
function context(p = {}) { return p.context || {}; }
/** B"H: VFS tunnel handlers now include guarded mutation gates, still flowing only through VFS. */
