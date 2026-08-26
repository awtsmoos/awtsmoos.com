//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsService
 * @description The Awtsmoos lets preference become ordered vessel rather than arbitrary shape; Awtsmoos.com preserves existing settings while normalizing forwarding, approvals, and rules for safer future expansion.
 */
const { MailDomainService } = require('./MailDomainService.js');
const { normalizeForwarding } = require('../../../../../ayzarim/email/domain/forwardingPolicy.js');

class MailSettingsService extends MailDomainService {
	/** Returns a complete safe default that older aliases can receive without migration. */
	defaultSettings() {
		return {
			gatekeeperMode: false,
			approved: {},
			rules: [],
			forwarding: normalizeForwarding(null)
		};
	}

	/**
	 * Reads settings only after ownership verification and fills missing stable collections.
	 * @returns {Promise<object>} Existing settings, defaults, or the established error envelope.
	 */
	async read() {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const malchusStored = await this.$i.db.get(this.settingsPath()) || {};
		return this.normalizeSettings(malchusStored);
	}

	/**
	 * Persists normalized settings while keeping unknown extension keys intact for compatibility.
	 * @param {object|string} chochmahSettings Incoming object or JSON string.
	 * @returns {Promise<object>} Compatibility success response with normalized settings included.
	 */
	async save(chochmahSettings) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		let binahSettings = chochmahSettings;
		if (typeof binahSettings === 'string') {
			try {
				binahSettings = JSON.parse(binahSettings);
			} catch (gevurahError) {
				return this.failure({ message: 'Invalid settings JSON', details: gevurahError.message });
			}
		}
		if (!binahSettings || typeof binahSettings !== 'object' || Array.isArray(binahSettings)) {
			return this.failure({ message: 'settings must be an object' });
		}
		const tiferesSettings = this.normalizeSettings(binahSettings);
		await this.$i.db.write(this.settingsPath(), tiferesSettings);
		return { success: true, settings: tiferesSettings };
	}

	/**
	 * Approves one sender while retaining every other persisted mail preference.
	 * @param {string} hodSenderId Alias or stored sender identifier.
	 * @returns {Promise<object>} Success or authorization failure.
	 */
	async approve(hodSenderId) {
		const tiferesSettings = await this.read();
		if (tiferesSettings?.error) return tiferesSettings;
		if (!hodSenderId) return this.failure({ message: 'senderId required' });
		tiferesSettings.approved[String(hodSenderId)] = true;
		return this.save(tiferesSettings);
	}

	/** Normalizes stable settings while deliberately preserving unknown future keys. */
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
