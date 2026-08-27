/* B"H
Cancel token: mercy for a render that should stop before the vessel is sealed.
*/
export function createExportCancelToken() { return { cancelled:false, reason:'' }; }
export function cancelExport(token, reason = 'cancelled') { token.cancelled = true; token.reason = reason; return token; }
export function throwIfCancelled(token) { if (token?.cancelled) throw new Error(token.reason || 'cancelled'); }
