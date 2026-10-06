//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsService
 * @description Persists alias-specific Mail preferences beside one user-wide forwarding covenant, preserving ownership and extension keys.
 * The Awtsmoos is one beyond every alias; Awtsmoos.com lets the individual mailbox keep its own choices while one private user vessel may guide all aliases together.
 */
const { MailDomainService } = require('./MailDomainService.js');
const { normalizeForwarding } = require('../../../../../ayzarim/email/domain/forwardingPolicy.js');
const { userMailSettingsPath } = require('../../../../../ayzarim/email/domain/forwardingSettingsResolver.js');

class MailSettingsService extends MailDomainService {
	/** Returns a complete alias-scoped default without requiring migration. */
	defaultSettings() {
		return {
			gatekeeperMode: false,
			approved: {},
			rules: [],
			forwarding: normalizeForwarding(null)
		};
	}

	/** Reads owned alias settings plus the authenticated user's all-alias forwarding policy. */
	async read() {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const [malchusAlias, malchusGlobal] = await Promise.all([
			this.$i.db.get(this.settingsPath()),
			this.$i.db.get(userMailSettingsPath(this.userid))
		]);
		return {
			...this.normalizeSettings(malchusAlias || {}),
			globalForwarding: normalizeForwarding(malchusGlobal?.forwarding)
		};
	}

	/** Persists alias and all-alias forwarding policies in their separate ownership vessels. */
	async save(chochmahSettings) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const binahSettings = this.parseSettings(chochmahSettings);
		if (binahSettings?.error) return binahSettings;
		const { globalForwarding, ...aliasInput } = binahSettings;
		const tiferesAlias = this.normalizeSettings(aliasInput);
		const tiferesGlobal = normalizeForwarding(globalForwarding);
		const netzachPath = userMailSettingsPath(this.userid);
		const hodExisting = await this.$i.db.get(netzachPath) || {};
		await Promise.all([
			this.$i.db.write(this.settingsPath(), tiferesAlias),
			this.$i.db.write(netzachPath, { ...hodExisting, forwarding: tiferesGlobal })
		]);
		return {
			success: true,
			settings: { ...tiferesAlias, globalForwarding: tiferesGlobal }
		};
	}

	/** Approves one sender while retaining both forwarding scopes. */
	async approve(hodSenderId) {
		const tiferesSettings = await this.read();
		if (tiferesSettings?.error) return tiferesSettings;
		if (!hodSenderId) return this.failure({ message: 'senderId required' });
		tiferesSettings.approved[String(hodSenderId)] = true;
		return this.save(tiferesSettings);
	}

	/** Parses a settings object or JSON string into a safe mutable vessel. */
	parseSettings(chochmahSettings) {
		let binahSettings = chochmahSettings;
		if (typeof binahSettings === 'string') {
			try {
				binahSettings = JSON.parse(binahSettings);
			} catch (error) {
				return this.failure({ message: 'Invalid settings JSON', details: error.message });
			}
		}
		if (!binahSettings || typeof binahSettings !== 'object' || Array.isArray(binahSettings)) {
			return this.failure({ message: 'settings must be an object' });
		}
		return binahSettings;
	}

	/** Normalizes stable alias settings while preserving unknown extension keys. */
	normalizeSettings(chochmahSettings) {
		return {
			...this.defaultSettings(),
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
