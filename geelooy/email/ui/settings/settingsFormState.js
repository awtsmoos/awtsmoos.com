//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsFormState
 * @description The Awtsmoos lets values move between hidden data and visible controls without tangling either vessel; Awtsmoos.com keeps forwarding, privacy, and capability state in one pure form translator.
 */
export class MailSettingsFormState {
	/**
	 * Captures registered form controls once so the lifecycle controller stays focused on opening, closing, and transport.
	 * @param {object} ui Awtsmoos UI registry.
	 */
	constructor(ui) {
		this.forwardEnabled = ui.getHtml('mailForwardEnabled');
		this.forwardTargets = ui.getHtml('mailForwardTargets');
		this.forwardKeepCopy = ui.getHtml('mailForwardKeepCopy');
		this.gatekeeper = ui.getHtml('mailGatekeeperEnabled');
	}

	/**
	 * Writes normalized server settings into visible controls and applies capability availability.
	 * @param {object} tiferesSettings Complete normalized Mail settings.
	 * @param {boolean} malchusForwardingLive Whether forwarding is verified live.
	 */
	apply(tiferesSettings, malchusForwardingLive) {
		const yesodForwarding = tiferesSettings.forwarding || {};
		if (this.forwardEnabled) this.forwardEnabled.checked = yesodForwarding.enabled === true;
		if (this.forwardKeepCopy) this.forwardKeepCopy.checked = yesodForwarding.keepCopy !== false;
		if (this.forwardTargets) {
			this.forwardTargets.value = Array.isArray(yesodForwarding.targets)
				? yesodForwarding.targets.join('\n')
				: '';
		}
		if (this.gatekeeper) this.gatekeeper.checked = tiferesSettings.gatekeeperMode === true;
		this.setForwardingAvailability(malchusForwardingLive);
	}

	/**
	 * Merges the current form values into the complete settings object without erasing unrelated advanced keys.
	 * @param {object} tiferesSettings Existing normalized Mail settings.
	 * @param {boolean} malchusForwardingLive Whether forwarding edits may be persisted.
	 * @returns {object} Complete settings object ready for the API.
	 */
	revealSettings(tiferesSettings, malchusForwardingLive) {
		const yesodForwarding = malchusForwardingLive
			? {
				enabled: this.forwardEnabled?.checked === true,
				targets: this.targets(),
				keepCopy: this.forwardKeepCopy?.checked !== false
			}
			: tiferesSettings.forwarding;
		return {
			...tiferesSettings,
			gatekeeperMode: this.gatekeeper?.checked === true,
			forwarding: yesodForwarding
		};
	}

	/**
	 * Returns unique, trimmed forwarding destinations from line- or comma-separated input.
	 * @returns {string[]} Maximum ten target strings; server policy performs canonical validation.
	 */
	targets() {
		const tiferesValue = String(this.forwardTargets?.value || '');
		return [...new Set(
			tiferesValue
				.split(/[\n,]+/)
				.map(malchusTarget => malchusTarget.trim())
				.filter(Boolean)
		)].slice(0, 10);
	}

	/**
	 * Enables or disables every forwarding control together so capability truth cannot drift between fields.
	 * @param {boolean} tiferesAvailable Whether forwarding is verified live.
	 */
	setForwardingAvailability(tiferesAvailable) {
		for (const malchusControl of [
			this.forwardEnabled,
			this.forwardTargets,
			this.forwardKeepCopy
		]) {
			if (malchusControl) malchusControl.disabled = !tiferesAvailable;
		}
	}
}
