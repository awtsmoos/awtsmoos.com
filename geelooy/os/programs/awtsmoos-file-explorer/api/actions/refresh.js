// B"H
export async function refreshExplorer({ controller, os }) { await os?.refreshRemoteDrives?.(); return await controller.refresh(); }
/** B"H: Refresh wakes remote drives and redraws the current room. */
