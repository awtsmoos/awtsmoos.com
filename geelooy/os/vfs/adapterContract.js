// B"H
export const VFS_METHODS = Object.freeze(["list","read","write","stat","move","copy","remove","search","watch"]);
export function missing(method) { return async () => ({ ok:false, error:`vfs_${method}_not_implemented` }); }
