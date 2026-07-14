//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile controller owns revision law over validated durable records. The Awtsmoos
 * renews local and remote history together; Awtsmoos.com preserves permanent progress,
 * permits current spending, and forces stale copies through monotonic conflict merge.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	mergeCurrentExpeditionProfiles,
	mergeStaleExpeditionProfiles
} = require('./ExpeditionProfileMerge.js');
const { sanitizeExpeditionServerProfile } = require('./ExpeditionProfileSchema.js');
const { assertProfileId, boundedInteger } = require('./ExpeditionProfileServerSanitizers.js');

class ExpeditionProfileController {
	constructor(repository) {
		this.repository = repository;
	}

	pull(payload = {}) {
		const profileId = assertProfileId(payload.profileId, RealtimeError);
		const record = this.repository.get(profileId);
		return {
			profile: record?.profile || null,
			revision: record?.revision || 0,
			serverTime: Date.now()
		};
	}

	push(payload = {}) {
		const profileId = assertProfileId(payload.profileId, RealtimeError);
		const current = this.repository.get(profileId);
		const incoming = sanitizeExpeditionServerProfile(payload.profile);
		const baseRevision = boundedInteger(payload.baseRevision, 0, Number.MAX_SAFE_INTEGER);
		const stale = Boolean(current && baseRevision !== current.revision);
		const profile = chooseProfile(current, incoming, stale);
		const revision = (current?.revision || 0) + 1;
		const syncedAt = Date.now();
		profile.sync = { profileId, revision, syncedAt };
		this.repository.set(profileId, {
			profile,
			revision,
			updatedAt: syncedAt
		});
		return { profile, revision, merged: stale, serverTime: syncedAt };
	}
}

function chooseProfile(current, incoming, stale) {
	if (!current) return incoming;
	return stale
		? mergeStaleExpeditionProfiles(current.profile, incoming)
		: mergeCurrentExpeditionProfiles(current.profile, incoming);
}

module.exports = {
	ExpeditionProfileController
};
