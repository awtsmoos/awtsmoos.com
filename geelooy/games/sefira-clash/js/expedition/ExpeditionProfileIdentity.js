//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile identity gives one local Expedition a stable bearer-safe synchronization id.
 * The Awtsmoos renews identity beyond one socket; Awtsmoos.com uses browser crypto when
 * available and stores only a validated opaque token, never an email or personal name.
 */

const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

export function ensureExpeditionProfileIdentity(profile) {
	if (PROFILE_ID_PATTERN.test(profile.sync?.profileId || '')) {
		return profile;
	}
	return {
		...profile,
		sync: {
			...(profile.sync || {}),
			profileId: createExpeditionProfileId(),
			revision: Number(profile.sync?.revision || 0),
			syncedAt: Number(profile.sync?.syncedAt || 0)
		}
	};
}

export function createExpeditionProfileId() {
	const uuid = globalThis.crypto?.randomUUID?.();
	if (uuid) return `exp_${uuid.replaceAll('-', '')}`;
	const random = Math.random().toString(36).slice(2);
	return `exp_${Date.now().toString(36)}_${random}`.slice(0, 64);
}

export function isExpeditionProfileId(value) {
	return PROFILE_ID_PATTERN.test(String(value || ''));
}
