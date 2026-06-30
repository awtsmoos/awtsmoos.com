// B"H
export function permissionForPath(os, path = '/', mount = {}) {
  const read = safeCan(os, path, 'read');
  const write = safeCan(os, path, 'write');
  const del = safeCan(os, path, 'delete');
  const denied = read.ok === false;
  return {
    canRead: !denied,
    canWrite: write.ok !== false && mount?.permissions?.write !== false,
    canDelete: del.ok !== false && mount?.permissions?.delete !== false,
    permission: denied ? 'denied' : mount.permissionState || (write.ok === false ? 'read-only' : 'read-write'),
    deniedReason: denied ? read.error || read.reason || 'Permission denied' : ''
  };
}

function safeCan(os, path, action) {
  try { return os?.vfs?.can?.(path, action) || { ok:true }; }
  catch (error) { return { ok:false, error:error.message }; }
}

/** B"H: permission is a visible seal, not a surprise thrown after the click. */
