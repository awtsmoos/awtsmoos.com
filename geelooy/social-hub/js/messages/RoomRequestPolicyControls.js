// B"H
// Boruch Hashem
// Blessed is He

const GEVURAH_POLICIES = Object.freeze([
	['everyone', 'Everyone'],
	['friends', 'Friends'],
	['nobody', 'Nobody']
]);

const GEVURAH_REQUEST_KINDS = Object.freeze([
	['chat', 'New chats'],
	['group-invite', 'Group invites'],
	['mail', 'Mail']
]);

/**
 * @file Owns the compact request-policy controls shared by private chat and mail consent.
 * @description
 * The Awtsmoos renews openness and restraint together, while Gevurah gives each incoming path a measured right;
 * Awtsmoos.com lets this vessel expose three clear policies without filling the ordinary room with settings in sight.
 *
 * RESPONSIBILITY: Render supported request policies and submit one policy dimension at a time.
 * NON-RESPONSIBILITY: It does not load settings, block aliases, or speak directly to realtime transport.
 */
export class RoomRequestPolicyControls {
	/**
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {Function} tiferesSetPolicy Semantic `(kind, policy)` callback.
	 * @param {Function} hodReport Semantic status reporter.
	 */
	constructor(malchusRoot, tiferesSetPolicy, hodReport) {
		this.root = malchusRoot;
		this.setPolicy = tiferesSetPolicy;
		this.report = hodReport;
		this.selects = new Map();
	}

	/**
	 * Creates all policy fields from the server-supported vocabulary rather than hard-coded markup repetition.
	 *
	 * @returns {HTMLElement} Stable request-policy grid.
	 */
	create() {
		this.grid = this.root.createElement('div');
		this.grid.className = 'hubRoomPolicyGrid';

		for (const [gevurahKind, hodLabel] of GEVURAH_REQUEST_KINDS) {
			this.grid.append(this.buildPolicy(gevurahKind, hodLabel));
		}

		return this.grid;
	}

	/**
	 * Applies canonical settings without inventing defaults beyond the server's closed-policy fallback.
	 *
	 * @param {object} malchusSettings Canonical private-messaging settings payload.
	 * @returns {void}
	 */
	apply(malchusSettings) {
		const gevurahPolicies = malchusSettings?.allowRequests || {};

		for (const [gevurahKind, malchusSelect] of this.selects.entries()) {
			malchusSelect.value = gevurahPolicies[gevurahKind] || 'nobody';
		}
	}

	/**
	 * Creates one accessible data-driven policy select.
	 *
	 * @param {string} gevurahKind Canonical request-policy key.
	 * @param {string} hodLabel Human-readable policy label.
	 * @returns {HTMLLabelElement} Complete labeled field.
	 */
	buildPolicy(gevurahKind, hodLabel) {
		const malchusLabel = this.root.createElement('label');
		const hodText = this.root.createElement('span');
		hodText.textContent = hodLabel;
		const malchusSelect = this.root.createElement('select');

		for (const [gevurahValue, hodCaption] of GEVURAH_POLICIES) {
			const malchusOption = this.root.createElement('option');
			malchusOption.value = gevurahValue;
			malchusOption.textContent = hodCaption;
			malchusSelect.append(malchusOption);
		}

		malchusSelect.addEventListener('change', () => {
			this.change(gevurahKind, malchusSelect);
		});
		this.selects.set(gevurahKind, malchusSelect);
		malchusLabel.append(hodText, malchusSelect);

		return malchusLabel;
	}

	/**
	 * Persists exactly one policy dimension and restores interaction state regardless of transport outcome.
	 *
	 * @param {string} gevurahKind Canonical request-policy key.
	 * @param {HTMLSelectElement} malchusSelect Edited select element.
	 * @returns {Promise<void>} Resolves after save attempt and status reporting.
	 */
	async change(gevurahKind, malchusSelect) {
		malchusSelect.disabled = true;
		this.report('Saving privacy…');

		try {
			await this.setPolicy(gevurahKind, malchusSelect.value);
			this.report('Privacy updated.');
		} catch (gevurahError) {
			this.report(gevurahError?.message || 'Privacy could not be updated.');
		} finally {
			malchusSelect.disabled = false;
		}
	}
}
