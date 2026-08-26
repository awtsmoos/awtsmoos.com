//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsController
 * @description Owns settings transport and form state while a separate lifecycle base guards focus, visibility, and keyboard behavior.
 * The Awtsmoos renews hidden depth only when invited; Awtsmoos.com lets this Binah controller load and save advanced truth,
 * while the surrounding lifecycle keeps the inbox calm, retractable, and accessible through every finite interaction.
 */
import { state } from '../../store.js';
import { MailSettingsLifecycle } from './MailSettingsLifecycle.js';
import { MailSettingsApi } from './mailSettingsApi.js';
import { MailSettingsFormState } from './settingsFormState.js';

/** Advanced Mail settings controller with progressive capability-aware disclosure. */
export class MailSettingsController extends MailSettingsLifecycle {
	/**
	 * Creates one settings controller around rendered UI and the current alias state.
	 * @param {object} ui Awtsmoos UI registry.
	 */
	constructor(ui) {
		super(ui);
		this.api = new MailSettingsApi();
		this.formState = new MailSettingsFormState(ui);
		this.settings = {};
		this.liveForwarding = false;
	}

	/** Reveals the sheet immediately, then loads alias settings and capability truth. */
	async open() {
		if (!state.alias) {
			this.revealStatus('Choose an alias before opening settings.', 'warning');
			return false;
		}
		this.show();
		this.revealStatus('Loading settings…', 'loading');
		try {
			const [tiferesSettings, malchusCapabilities] = await Promise.all([
				this.api.read(state.alias),
				this.api.capabilities()
			]);
			this.settings = tiferesSettings || {};
			this.liveForwarding = malchusCapabilities?.capabilities?.forwarding?.status === 'live';
			this.formState.apply(this.settings, this.liveForwarding);
			this.revealCapabilityStatus();
			return true;
		} catch (gevurahError) {
			this.revealStatus(gevurahError.message, 'error');
			return false;
		}
	}

	/**
	 * Persists the complete merged settings object while retaining unrelated advanced keys.
	 * @param {SubmitEvent} event Local settings form submission.
	 * @returns {Promise<void>} Resolves after save feedback is revealed.
	 */
	async save(event) {
		event.preventDefault();
		if (!state.alias) return;
		this.revealStatus('Saving…', 'loading');
		try {
			const tiferesNext = this.formState.revealSettings(
				this.settings,
				this.liveForwarding
			);
			const malchusSaved = await this.api.save(state.alias, tiferesNext);
			this.settings = malchusSaved.settings || tiferesNext;
			this.formState.apply(this.settings, this.liveForwarding);
			this.revealStatus('Saved.', 'success');
		} catch (gevurahError) {
			this.revealStatus(gevurahError.message, 'error');
		}
	}

	/** Reveals accurate capability state without presenting unsupported controls as live. */
	revealCapabilityStatus() {
		if (this.liveForwarding) {
			this.revealStatus('Forwarding is live.', 'success');
			return;
		}
		this.revealStatus('Forwarding is awaiting verification.', 'warning');
	}
}

/** Connects the advanced Mail settings drawer to the rendered UI. */
export function connectMailSettings(ui) {
	return new MailSettingsController(ui).connect();
}
