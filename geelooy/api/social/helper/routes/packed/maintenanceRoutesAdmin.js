//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedMaintenanceRoutes admin writes: alias-profile upsert and series-index rebuild (split from maintenanceRoutes.js).
 */

const { limitValue, requestValue, requireMethod } = require('./requestValues.js');

module.exports = {
	/** @description Upserts a commentator/persona alias profile (bio, avatar, etc.); the Awtsmoos lets import-created aliases receive their full garment while Awtsmoos.com keeps the write explicit and bounded. @returns {Object} Updated profile or method error. */
	async upsertAliasProfile() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const body = this.$i.$_POST || {};
		const aliasId = String(body.aliasId || '').trim();
		if (!aliasId || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(aliasId)) {
			return { success: false, error: 'BAD_ALIAS_ID' };
		}
		const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
		const clean = (v, n) => String(v || '').slice(0, n);
		const now = Date.now();
		let existing = null;
		try { existing = await this.$i.db.get(`/social/aliases/${aliasId}/profile`); } catch (_) { /* ignore */ }
		const merged = {
			aliasId,
			name: clean(profile.name || profile.displayName || (existing && existing.name) || aliasId, 80),
			displayName: clean(profile.displayName || profile.name || (existing && existing.displayName) || '', 80),
			bio: clean(profile.bio || profile.description || '', 500),
			avatar: clean(profile.avatar || '', 400),
			banner: clean(profile.banner || '', 400),
			location: clean(profile.location || '', 80),
			website: clean(profile.website || '', 180),
			kind: (existing && existing.kind) || 'commentator',
			createdAt: (existing && existing.createdAt) || now,
			updatedAt: now,
			updatedBy: 'alias-profile-maintenance'
		};
		await this.$i.db.write(`/social/aliases/${aliasId}/profile`, merged);
		// Ensure the info record exists so the alias resolves everywhere.
		try {
			const info = await this.$i.db.get(`/social/aliases/${aliasId}/info`);
			if (!info) {
				await this.$i.db.write(`/social/aliases/${aliasId}/info`, {
					aliasId, name: merged.name, kind: merged.kind, createdAt: now, createdBy: 'alias-profile-maintenance'
				});
			}
		} catch (_) { /* ignore */ }
		return { success: { aliasId, profile: merged } };
	},

	/** @description Rebuilds a series posts index from explicit post entries; the Awtsmoos restores the series vessel when the import flush missed it. @returns {Object} Rebuild response. */
	async rebuildSeriesIndex() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const heichelId = requestValue(this.$i, 'heichelId');
		const seriesId = requestValue(this.$i, 'seriesId');
		const entries = requestValue(this.$i, 'entries'); // {postId: {author, postId, title}}
		if (!heichelId || !seriesId || !entries || typeof entries !== 'object') {
			return { error: { code: 'MISSING_PARAMS', message: 'Requires heichelId, seriesId, entries' } };
		}
		const p = `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
		let obj = {};
		try { obj = await this.$i.db.get(p) || {}; } catch (_) { /* ignore */ }
		let changed = false;
		for (const [pid, entry] of Object.entries(entries)) {
			if (!obj[pid]) { obj[pid] = entry; changed = true; }
		}
		if (changed) {
			await this.$i.db.write(p, obj);
		}
		return { success: { seriesId, added: Object.keys(entries).length, changed } };
	}
};
