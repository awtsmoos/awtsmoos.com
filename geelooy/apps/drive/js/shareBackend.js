//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveShareBackend
 * @description
 * Integrator-owned binding between WS-4's share model (js/sharing.js) and the
 * WS-7 drive backend share route. The share covenant must travel the dedicated
 * /share route — the generic metadata PUT cannot set entry.visibility=public
 * and needs a different scope (drive.public) for public mode.
 *
 * WS-7 contract:
 *   POST /api/social/drive/{alias}/share/{path}
 *        {mode, members?, publicId?} -> {entry, event}   (entry.share is the covenant)
 *   GET  /api/social/drive/{alias}/entry/{path} -> entry (share read from entry.share)
 *
 * The host injects `request(method, path, body)` — the Drive app's existing
 * authed transport (aliasSegment/authenticationHeaders) — so this module never
 * touches tokens or the DOM. Pure and unit-testable.
 */

export function encodeDrivePath(path) {
	return String(path || '').split('/').map(segment => encodeURIComponent(segment)).join('/');
}

/**
 * Creates the server share backend for one drive alias.
 * @param {{alias:string, request:(method:string, path:string, body?:object)=>Promise<object>}} options
 * @returns {{getShare(folderPath:string)=>Promise<object|null>, setShare(folderPath:string, share:object)=>Promise<object|null>}}
 */
export function createShareBackend({ alias, request } = {}) {
	if (!alias) throw new Error('createShareBackend requires an alias');
	if (typeof request !== 'function') throw new Error('createShareBackend requires request(method, path, body)');
	const base = `/drive/${encodeURIComponent(alias)}`;
	return {
		async getShare(folderPath) {
			const data = await request('GET', `${base}/entry/${encodeDrivePath(folderPath)}`);
			return (data && data.entry && data.entry.share) || null;
		},
		async setShare(folderPath, share) {
			const body = { mode: share.mode };
			if (Array.isArray(share.members)) body.members = share.members;
			if (share.publicId) body.publicId = share.publicId;
			const data = await request('POST', `${base}/share/${encodeDrivePath(folderPath)}`, body);
			return (data && data.entry && data.entry.share) || null;
		}
	};
}
