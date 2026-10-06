//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsFormState
 * @description Translates alias-specific and user-wide forwarding policies between server settings and the visible Mail settings form.
 * The Awtsmoos lets one broad intention and one particular alias intention coexist without collision; Awtsmoos.com keeps both scopes visible, bounded, and independently editable.
 */
import { syncSwitchState } from './settingsView.js?v=mail-forwarding-001';

export class MailSettingsFormState {
	/** Captures every settings control once so lifecycle and transport remain separate. */
	constructor(ui) {
		this.aliasForward = this.forwardingControls(ui, 'mailAliasForward');
		this.globalForward = this.forwardingControls(ui, 'mailGlobalForward');
		this.gatekeeper = ui.getHtml('mailGatekeeperEnabled');
	}

	/** Returns one forwarding control family from a stable UI-registry prefix. */
	forwardingControls(ui, prefix) {
		return {
			enabled: ui.getHtml(`${prefix}Enabled`),
			targets: ui.getHtml(`${prefix}Targets`),
			keepCopy: ui.getHtml(`${prefix}KeepCopy`)
		};
	}

	/** Writes normalized alias and all-alias policies into visible controls. */
	apply(settings, forwardingLive) {
		this.applyForwarding(this.aliasForward, settings.forwarding || {});
		this.applyForwarding(this.globalForward, settings.globalForwarding || {});
		if (this.gatekeeper) {
			this.gatekeeper.checked = settings.gatekeeperMode === true;
			syncSwitchState(this.gatekeeper);
		}
		this.setForwardingAvailability(forwardingLive);
	}

	/** Applies one normalized forwarding policy to one control family. */
	applyForwarding(controls, forwarding) {
		if (controls.enabled) {
			controls.enabled.checked = forwarding.enabled === true;
			syncSwitchState(controls.enabled);
		}
		if (controls.keepCopy) {
			controls.keepCopy.checked = forwarding.keepCopy !== false;
			syncSwitchState(controls.keepCopy);
		}
		if (controls.targets) {
			controls.targets.value = Array.isArray(forwarding.targets)
				? forwarding.targets.join('\n')
				: '';
		}
	}

	/** Merges both forwarding scopes into the complete settings object. */
	revealSettings(settings, forwardingLive) {
		return {
			...settings,
			gatekeeperMode: this.gatekeeper?.checked === true,
			forwarding: forwardingLive
				? this.revealForwarding(this.aliasForward)
				: settings.forwarding,
			globalForwarding: forwardingLive
				? this.revealForwarding(this.globalForward)
				: settings.globalForwarding
		};
	}

	/** Returns one policy from one forwarding control family. */
	revealForwarding(controls) {
		return {
			enabled: controls.enabled?.checked === true,
			targets: this.targets(controls.targets),
			keepCopy: controls.keepCopy?.checked !== false
		};
	}

	/** Returns unique trimmed destinations from line- or comma-separated input. */
	targets(control) {
		return [...new Set(
			String(control?.value || '')
				.split(/[\n,]+/)
				.map(target => target.trim())
				.filter(Boolean)
		)].slice(0, 10);
	}

	/** Enables or disables every forwarding control together from capability truth. */
	setForwardingAvailability(available) {
		for (const family of [this.aliasForward, this.globalForward]) {
			for (const control of Object.values(family)) {
				if (control) control.disabled = !available;
			}
		}
	}
}
