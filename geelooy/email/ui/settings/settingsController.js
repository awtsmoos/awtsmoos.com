//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsController
 * @description The Awtsmoos lets hidden depth answer only when invited; Awtsmoos.com opens one advanced drawer, restores focus when it closes, and binds live capability truth to simple routing and privacy controls without cluttering the inbox.
 */
import { state } from '../../store.js';
import { MailSettingsApi } from './mailSettingsApi.js';

export class MailSettingsController {
	/**
	 * Creates one settings lifecycle around registered Mail elements.
	 * @param {object} ui Awtsmoos UI registry.
	 */
	constructor(ui) {
		this.ui = ui;
		this.api = new MailSettingsApi();
		this.settings = {};
		this.liveForwarding = false;
		this.trigger = ui.getHtml('mailSettingsToggle');
		this.layer = ui.getHtml('mailSettingsLayer');
		this.drawer = ui.getHtml('mailSettingsDrawer');
		this.closeButton = ui.getHtml('mailSettingsClose');
		this.backdrop = ui.getHtml('mailSettingsBackdrop');
		this.form = ui.getHtml('mailSettingsForm');
		this.status = ui.getHtml('mailSettingsStatus');
		this.forwardEnabled = ui.getHtml('mailForwardEnabled');
		this.forwardTargets = ui.getHtml('mailForwardTargets');
		this.forwardKeepCopy = ui.getHtml('mailForwardKeepCopy');
		this.gatekeeper = ui.getHtml('mailGatekeeperEnabled');
		this.boundOpen = () => this.open();
		this.boundClose = () => this.close();
		this.boundSubmit = event => this.save(event);
		this.boundKey = event => this.onKey(event);
	}

	/** Connects the drawer controls exactly once and returns the active controller. */
	connect() {
		if (!this.trigger || !this.layer || !this.form) return null;
		this.trigger.addEventListener('click', this.boundOpen);
		this.closeButton?.addEventListener('click', this.boundClose);
		this.backdrop?.addEventListener('click', this.boundClose);
		this.form.addEventListener('submit', this.boundSubmit);
		document.addEventListener('keydown', this.boundKey);
		return this;
	}

	/** Removes every listener installed by connect for safe remounts and tests. */
	disconnect() {
		this.trigger?.removeEventListener('click', this.boundOpen);
		this.closeButton?.removeEventListener('click', this.boundClose);
		this.backdrop?.removeEventListener('click', this.boundClose);
		this.form?.removeEventListener('submit', this.boundSubmit);
		document.removeEventListener('keydown', this.boundKey);
	}

	/** Reveals the drawer immediately, then loads settings and capability truth for the current alias. */
	async open() {
		if (!state.alias) return this.revealStatus('Choose an alias before opening settings.', 'warning');
		this.layer.dataset.state = 'open';
		this.layer.setAttribute('aria-hidden', 'false');
		this.trigger.setAttribute('aria-expanded', 'true');
		this.revealStatus('Loading settings…', 'loading');
		this.closeButton?.focus();
		try {
			const [tiferesSettings, malchusCapabilities] = await Promise.all([
				this.api.read(state.alias),
				this.api.capabilities()
			]);
			this.settings = tiferesSettings || {};
			this.liveForwarding = malchusCapabilities?.capabilities?.forwarding?.status === 'live';
			this.applySettings();
			this.revealStatus(this.liveForwarding ? 'Forwarding is live.' : 'Forwarding is awaiting verification.', this.liveForwarding ? 'success' : 'warning');
		} catch (gevurahError) {
			this.revealStatus(gevurahError.message, 'error');
		}
	}

	/** Closes the sheet, restores the owning button, and leaves loaded values intact for quick reopening. */
	close() {
		if (!this.layer || this.layer.dataset.state !== 'open') return false;
		this.layer.dataset.state = 'closed';
		this.layer.setAttribute('aria-hidden', 'true');
		this.trigger?.setAttribute('aria-expanded', 'false');
		this.trigger?.focus();
		return true;
	}

	/** Populates controls from normalized server settings and capability availability. */
	applySettings() {
		const tiferesForwarding = this.settings.forwarding || {};
		this.forwardEnabled.checked = tiferesForwarding.enabled === true;
		this.forwardKeepCopy.checked = tiferesForwarding.keepCopy !== false;
		this.forwardTargets.value = Array.isArray(tiferesForwarding.targets)
			? tiferesForwarding.targets.join('\n')
			: '';
		this.gatekeeper.checked = this.settings.gatekeeperMode === true;
		for (const malchusControl of [this.forwardEnabled, this.forwardTargets, this.forwardKeepCopy]) {
			malchusControl.disabled = !this.liveForwarding;
		}
	}

	/** Persists a complete merged settings object so unrelated advanced keys remain untouched. */
	async save(event) {
		event.preventDefault();
		if (!state.alias) return;
		this.revealStatus('Saving…', 'loading');
		const tiferesForwarding = this.liveForwarding
			? {
				enabled: this.forwardEnabled.checked,
				targets: this.targets(),
				keepCopy: this.forwardKeepCopy.checked
			}
			: this.settings.forwarding;
		try {
			const malchusSaved = await this.api.save(state.alias, {
				...this.settings,
				gatekeeperMode: this.gatekeeper.checked,
				forwarding: tiferesForwarding
			});
			this.settings = malchusSaved.settings || this.settings;
			this.applySettings();
			this.revealStatus('Saved.', 'success');
		} catch (gevurahError) {
			this.revealStatus(gevurahError.message, 'error');
		}
	}

	/** Returns unique trimmed forwarding destinations from line- or comma-separated input. */
	targets() {
		return [...new Set(String(this.forwardTargets.value || '')
			.split(/[\n,]+/)
			.map(tiferesTarget => tiferesTarget.trim())
			.filter(Boolean))]
			.slice(0, 10);
	}

	/** Closes the open drawer on Escape while leaving unrelated keyboard flows untouched. */
	onKey(event) {
		if (event.key === 'Escape' && this.close()) event.preventDefault();
	}

	/** Updates the local aria-live status vessel with semantic state for CSS and assistive technology. */
	revealStatus(message, status = 'idle') {
		if (!this.status) return;
		this.status.textContent = String(message || '');
		this.status.dataset.status = status;
	}
}

/** Connects the advanced Mail settings drawer to the rendered UI. */
export function connectMailSettings(ui) {
	return new MailSettingsController(ui).connect();
}
