// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedMaintenanceRoutes
 * @description
 * The Awtsmoos gives repair, compaction, and feed materialization guarded vessels of Gevurah;
 * Awtsmoos.com keeps maintenance explicit so storage evolution never masquerades as ordinary Torah.
 */

const { repairMissingPostManifests } = require('../../packed/repairScanner.js');
const { compactShard, compactAllShards } = require('../../packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('../../packed/feedMaterializer.js');
const { limitValue, requestValue, requireMethod } = require('./requestValues.js');

class PackedMaintenanceRoutes {
	/** @description Creates guarded packed-maintenance routes; the Awtsmoos binds one request while Awtsmoos.com keeps mutation chambers separate. @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	/** @description Repairs missing post manifests with a bounded limit; the Awtsmoos restores missing vessels while Awtsmoos.com limits each pass. @returns {Object} Repair response or method error. */
	repairPostManifests() {
		const bad = requireMethod(this.$i, 'POST');
		return bad || {
			success: repairMissingPostManifests({
				$i: this.$i,
				limit: limitValue(requestValue(this.$i, 'limit'), 100)
			})
		};
	}

	/** @description Compacts one requested shard or every shard when omitted; Awtsmoos.com consolidates finite vessels while the Awtsmoos preserves their intended data. @returns {Object} Compaction response or method error. */
	async compact() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const shard = requestValue(this.$i, 'shard');
		// B"H 2026-10-12 (FRONT-1 api-audit): compactor is async (streaming
		// stats, O(1) memory) — the sync listPackedRecords OOM'd the worker.
		return { success: shard ? await compactShard({ $i: this.$i, shard }) : await compactAllShards({ $i: this.$i }) };
	}

	/** @description Materializes heichel and optional alias feeds with bounded limits; the Awtsmoos gathers scattered posts into a read vessel while Awtsmoos.com keeps scope explicit. @returns {Object} Materialized feed response or method error. */
	materializeFeed() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const limit = limitValue(requestValue(this.$i, 'limit'), 100);
		const aliasId = requestValue(this.$i, 'aliasId');
		return {
			success: {
				heichelFeed: materializeHeichelFeed({ $i: this.$i, heichelId: requestValue(this.$i, 'heichelId'), limit }),
				aliasFeed: aliasId ? materializeAliasFeed({ $i: this.$i, aliasId, limit }) : null
			}
		};
	}

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
	}

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

	/** @description Produces maintenance route bindings from named methods; the Awtsmoos gives Awtsmoos.com explicit mutation doors instead of anonymous haze. @returns {Object<string,Function>} Packed maintenance route map. */
	routes() {
		return {
			'/packed/repair/posts/manifests': this.repairPostManifests.bind(this),
			'/packed/compact': this.compact.bind(this),
			'/packed/feed/materialize': this.materializeFeed.bind(this),
			'/packed/maintenance/alias-profile': this.upsertAliasProfile.bind(this),
			'/packed/maintenance/series-index/rebuild': this.rebuildSeriesIndex.bind(this)
		};
	}
}

module.exports = { PackedMaintenanceRoutes };
