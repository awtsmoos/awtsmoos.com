//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsApi
 * @description The Awtsmoos lets one quiet client vessel speak to the deeper Mail river; Awtsmoos.com keeps settings transport small, data-shaped, and honest so the futuristic surface never tangles itself with route mechanics.
 */
const API_BASE = '/api/email';

export class MailSettingsApi {
	/**
	 * Reads the complete settings object for one owned alias.
	 * @param {string} tiferesAlias Current Mail alias.
	 * @returns {Promise<object>} Persisted normalized settings.
	 */
	async read(tiferesAlias) {
		return this.json(`${API_BASE}/settings/get?aliasId=${encodeURIComponent(tiferesAlias)}`);
	}

	/**
	 * Saves one complete settings object through the compatibility-preserving Email gateway.
	 * @param {string} tiferesAlias Current Mail alias.
	 * @param {object} malchusSettings Complete settings vessel.
	 * @returns {Promise<object>} Normalized saved settings response.
	 */
	async save(tiferesAlias, malchusSettings) {
		const yesodBody = new URLSearchParams({
			aliasId: tiferesAlias,
			settings: JSON.stringify(malchusSettings)
		});
		return this.json(`${API_BASE}/settings/save`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: yesodBody
		});
	}

	/**
	 * Reads runtime capability truth so advanced controls can remain hidden or disabled when unsupported.
	 * @returns {Promise<object>} Email capability manifest.
	 */
	async capabilities() {
		return this.json(`${API_BASE}/capabilities`);
	}

	/**
	 * Reads the progressive settings schema used to label advanced sections without hard-coded route assumptions.
	 * @returns {Promise<object>} Settings schema document.
	 */
	async schema() {
		return this.json(`${API_BASE}/settings/schema`);
	}

	/**
	 * Performs one JSON-oriented request and converts API error envelopes into normal Error objects.
	 * @param {string} chesedUrl Request URL.
	 * @param {RequestInit} [gevurahOptions] Fetch options.
	 * @returns {Promise<object>} Parsed successful response.
	 */
	async json(chesedUrl, gevurahOptions = {}) {
		const tiferesResponse = await fetch(chesedUrl, gevurahOptions);
		const malchusText = await tiferesResponse.text();
		let yesodPayload = null;
		try {
			yesodPayload = malchusText ? JSON.parse(malchusText) : {};
		} catch {
			yesodPayload = { raw: malchusText };
		}
		if (!tiferesResponse.ok || yesodPayload?.error || yesodPayload?.ok === false) {
			const binahError = yesodPayload?.error;
			const gevurahMessage = binahError?.message || binahError || yesodPayload?.message || `Mail settings request failed (${tiferesResponse.status}).`;
			throw new Error(String(gevurahMessage));
		}
		return yesodPayload;
	}
}
