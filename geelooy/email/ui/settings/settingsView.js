//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsView
 * @description The Awtsmoos hides depth until the vessel asks for it; Awtsmoos.com keeps advanced Mail power retractable, readable, and touch-safe so the default inbox remains calm while deeper routing and privacy remain one gesture away.
 */

/**
 * Returns the complete local settings drawer descriptor consumed by the Mail UI renderer.
 * @returns {object} UI descriptor containing backdrop, drawer, forwarding, privacy, and status vessels.
 */
export function settingsDrawerDescriptor() {
	return {
		tag: 'div',
		classList: ['mail-settings-layer'],
		shaym: 'mailSettingsLayer',
		attributes: { 'data-state': 'closed', 'aria-hidden': 'true' },
		children: [backdropDescriptor(), drawerDescriptor()]
	};
}

/** Returns the dismissible local backdrop descriptor. */
function backdropDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsBackdrop',
		classList: ['mail-settings-backdrop'],
		attributes: { type: 'button', tabindex: '-1', 'aria-label': 'Close Mail settings' }
	};
}

/** Returns the accessible side-sheet descriptor containing progressive advanced settings. */
function drawerDescriptor() {
	return {
		tag: 'aside',
		shaym: 'mailSettingsDrawer',
		classList: ['mail-settings-drawer'],
		attributes: {
			role: 'dialog',
			'aria-modal': 'true',
			'aria-labelledby': 'mail-settings-title'
		},
		children: [settingsHeader(), settingsForm(), settingsStatus()]
	};
}

/** Returns drawer heading, compact explanation, and close action. */
function settingsHeader() {
	return {
		tag: 'header',
		classList: ['mail-settings-header'],
		children: [
			{
				tag: 'div',
				children: [
					{ tag: 'span', classList: ['mail-settings-kicker'], textContent: 'Mail controls' },
					{ tag: 'h2', attributes: { id: 'mail-settings-title' }, textContent: 'Advanced settings' },
					{ tag: 'p', textContent: 'Powerful routing and privacy, collapsed until you need it.' }
				]
			},
			{
				tag: 'button',
				shaym: 'mailSettingsClose',
				classList: ['mail-settings-close'],
				attributes: { type: 'button', 'aria-label': 'Close settings' },
				textContent: '×'
			}
		]
	};
}

/** Returns the progressive form; each advanced family remains independently retractable. */
function settingsForm() {
	return {
		tag: 'form',
		shaym: 'mailSettingsForm',
		classList: ['mail-settings-form'],
		children: [forwardingSection(), privacySection(), saveDescriptor()]
	};
}

/** Returns live forwarding controls with multiline target entry and source-copy policy. */
function forwardingSection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		attributes: { open: '' },
		children: [
			{ tag: 'summary', textContent: 'Forwarding' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Send delivered inbox mail onward without risking the original copy.' },
			toggleDescriptor('mailForwardEnabled', 'Enable forwarding'),
			{
				tag: 'label',
				classList: ['mail-settings-field'],
				children: [
					{ tag: 'span', textContent: 'Forward to' },
					{
						tag: 'textarea',
						shaym: 'mailForwardTargets',
						attributes: { rows: '3', placeholder: 'name@example.com\none@awtsmoos.com' }
					},
					{ tag: 'small', textContent: 'One address per line or comma-separated. Up to 10 destinations.' }
				]
			},
			toggleDescriptor('mailForwardKeepCopy', 'Keep a copy in this inbox')
		]
	};
}

/** Returns the existing gatekeeper privacy control without exposing raw settings JSON. */
function privacySection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		children: [
			{ tag: 'summary', textContent: 'Privacy & requests' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Require unapproved senders to enter the request queue before reaching your inbox.' },
			toggleDescriptor('mailGatekeeperEnabled', 'Gatekeeper mode')
		]
	};
}

/** Returns one labeled checkbox row with stable UI registry identity. */
function toggleDescriptor(shaym, label) {
	return {
		tag: 'label',
		classList: ['mail-settings-toggle'],
		children: [
			{ tag: 'input', shaym, attributes: { type: 'checkbox' } },
			{ tag: 'span', classList: ['mail-settings-toggle-track'], attributes: { 'aria-hidden': 'true' } },
			{ tag: 'span', textContent: label }
		]
	};
}

/** Returns the sticky save action descriptor. */
function saveDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsSave',
		classList: ['mail-settings-save'],
		attributes: { type: 'submit' },
		textContent: 'Save changes'
	};
}

/** Returns an aria-live status line used for loading, saved, unsupported, and error states. */
function settingsStatus() {
	return {
		tag: 'p',
		shaym: 'mailSettingsStatus',
		classList: ['mail-settings-status'],
		attributes: { role: 'status', 'aria-live': 'polite' },
		textContent: 'Settings load when this panel opens.'
	};
}
