//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsFormState
 * @description Translates one alias-specific and one user-wide forwarding covenant between normalized settings and visible controls without duplicating form authority.
 * The Awtsmoos is one beyond scope; Awtsmoos.com lets a single alias and the whole family of aliases each reveal their own forwarding intention while one state translator keeps them distinct.
 */
import { syncSwitchState } from './settingsView.js';

export class MailSettingsFormState {
	/** Captures the forwarding scopes and Gatekeeper control from the rendered registry. */
	constructor(ui) {
		this.aliasPolicy = this.capturePolicy(ui, 'Alias');
		this.globalPolicy = this.capturePolicy(ui, 'Global');
		this.gatekeeper = ui.getHtml('mailGatekeeperEnabled');
	}

	/** Returns one forwarding scope's three controls. */
	capturePolicy(ui, scope) {
		return {
			enabled: ui.getHtml(`mail${scope}ForwardEnabled`),
			targets: ui.getHtml(`mail${scope}ForwardTargets`),
			keepCopy: ui.getHtml(`mail${scope}ForwardKeepCopy`)
		};
	}

	/** Writes normalized alias and global settings into the visible controls. */
	apply(settings, forwardingLive) {
		this.applyPolicy(this.aliasPolicy, settings.forwarding || {});
		this.applyPolicy(this.globalPolicy, settings.globalForwarding || {});
		if (this.gatekeeper) {
			this.gatekeeper.checked = settings.gatekeeperMode === true;
			syncSwitchState(this.gatekeeper);
		}
		this.setForwardingAvailability(forwardingLive);
	}

	/** Applies one normalized forwarding policy to one visible scope. */
	applyPolicy(controls, policy) {
		if (controls.enabled) {
			controls.enabled.checked = policy.enabled === true;
			syncSwitchState(controls.enabled);
		}
		if (controls.keepCopy) {
			controls.keepCopy.checked = policy.keepCopy !== false;
			syncSwitchState(controls.keepCopy);
		}
		if (controls.targets) {
			controls.targets.value = Array.isArray(policy.targets) ? policy.targets.join('\n') : '';
		}
	}

	/** Merges visible forwarding scopes back into the complete settings object. */
	revealSettings(settings, forwardingLive) {
		return {
			...settings,
			gatekeeperMode: this.gatekeeper?.checked === true,
			forwarding: forwardingLive ? this.revealPolicy(this.aliasPolicy) : settings.forwarding,
			globalForwarding: forwardingLive
				? this.revealPolicy(this.globalPolicy)
				: settings.globalForwarding
		};
	}

	/** Returns one scope's normalized client-side policy; server policy performs canonical validation. */
	revealPolicy(controls) {
		return {
			enabled: controls.enabled?.checked === true,
			targets: this.targets(controls.targets),
			keepCopy: controls.keepCopy?.checked !== false
		};
	}

	/** Returns unique, trimmed destinations from line- or comma-separated input. */
	targets(control) {
		return [...new Set(
			String(control?.value || '')
				.split(/[\n,]+/)
				.map(target => target.trim())
				.filter(Boolean)
		)].slice(0, 10);
	}

	/** Enables or disables every forwarding control together from one capability truth. */
	setForwardingAvailability(available) {
		for (const policy of [this.aliasPolicy, this.globalPolicy]) {
			for (const control of Object.values(policy)) {
				if (control) control.disabled = !available;
			}
		}
	}
}
