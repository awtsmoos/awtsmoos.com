//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsService
 * @description Persists alias Mail preferences and one user-wide forwarding policy without confusing their ownership scopes.
 * The Awtsmoos lets the particular alias and the encompassing user intention coexist; Awtsmoos.com normalizes each vessel while preserving future extension keys.
 */
const { MailDomainService } = require('./MailDomainService.js');
const { normalizeForwarding } = require('../../../../../ayzarim/email/domain/forwardingPolicy.js');
const {
	readGlobalForwarding,
	saveGlobalForwarding
} = require('./globalForwardingSettings.js');

class MailSettingsService extends MailDomainService {
	/** Returns a complete safe alias default that older mailboxes can receive without migration. */
	defaultSettings() {
		return {
			gatekeeperMode: false,
			approved: {},
			rules: [],
			forwarding: normalizeForwarding(null)
		};
	}

	/** Reads alias settings plus the authenticated owner's all-alias forwarding policy. */
	async read() {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const [malchusStored, tiferesGlobal] = await Promise.all([
			this.$i.db.get(this.settingsPath()),
			readGlobalForwarding(this.$i.db, this.userid)
		]);
		return {
			...this.normalizeSettings(malchusStored || {}),
			globalForwarding: tiferesGlobal
		};
	}

	/** Persists alias settings and, when supplied, the user's all-alias forwarding policy. */
	async save(chochmahSettings) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		let binahSettings = this.parseSettings(chochmahSettings);
		if (binahSettings?.error) return binahSettings;
		const { globalForwarding, ...hodAliasInput } = binahSettings;
		const tiferesSettings = this.normalizeSettings(hodAliasInput);
		await this.$i.db.write(this.settingsPath(), tiferesSettings);
		const netzachGlobal = globalForwarding === undefined
			? await readGlobalForwarding(this.$i.db, this.userid)
			: await saveGlobalForwarding(this.$i.db, this.userid, globalForwarding);
		return {
			success: true,
			settings: {
				...tiferesSettings,
				globalForwarding: netzachGlobal
			}
		};
	}

	/** Approves one sender while retaining every persisted Mail preference. */
	async approve(hodSenderId) {
		const tiferesSettings = await this.read();
		if (tiferesSettings?.error) return tiferesSettings;
		if (!hodSenderId) return this.failure({ message: 'senderId required' });
		tiferesSettings.approved[String(hodSenderId)] = true;
		return this.save(tiferesSettings);
	}

	/** Parses object or JSON-string input into one validated settings object. */
	parseSettings(chochmahSettings) {
		let malchusSettings = chochmahSettings;
		if (typeof malchusSettings === 'string') {
			try {
				malchusSettings = JSON.parse(malchusSettings);
			} catch (error) {
				return this.failure({ message: 'Invalid settings JSON', details: error.message });
			}
		}
		if (!malchusSettings || typeof malchusSettings !== 'object' || Array.isArray(malchusSettings)) {
			return this.failure({ message: 'settings must be an object' });
		}
		return malchusSettings;
	}

	/** Normalizes stable alias settings while deliberately preserving unknown future keys. */
	normalizeSettings(chochmahSettings) {
		const malchusDefaults = this.defaultSettings();
		return {
			...malchusDefaults,
			...chochmahSettings,
			approved: chochmahSettings.approved && typeof chochmahSettings.approved === 'object'
				? chochmahSettings.approved
				: {},
			rules: Array.isArray(chochmahSettings.rules) ? chochmahSettings.rules : [],
			forwarding: normalizeForwarding(chochmahSettings.forwarding)
		};
	}
}

module.exports = { MailSettingsService };
