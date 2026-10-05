//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsSections
 * @description Reveals two forwarding scopes without duplicating the Mail settings system: one alias-specific covenant and one user-wide covenant for every owned alias.
 */

/** Returns forwarding controls for the selected alias and the authenticated user's entire alias family. */
export function forwardingSection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		attributes: { open: '' },
		children: [
			{ tag: 'summary', textContent: 'Forwarding' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Choose forwarding for only this alias, all aliases you own, or both. Matching destinations are sent once.' },
			policyDescriptor('Alias', 'This alias', 'Only mail arriving at the currently selected alias.'),
			policyDescriptor('Global', 'All my aliases', 'Applies to every alias you own, including aliases created later.')
		]
	};
}

/** Returns the existing Gatekeeper privacy family. */
export function privacySection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		children: [
			{ tag: 'summary', textContent: 'Privacy & requests' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Hold unapproved senders in the request queue before their mail reaches the inbox.' },
			toggleDescriptor('mailGatekeeperEnabled', 'Gatekeeper mode')
		]
	};
}

/** Builds one forwarding scope using the shared Mail field and switch vessels. */
function policyDescriptor(scope, title, help) {
	return {
		tag: 'section',
		classList: ['mail-settings-forwarding-scope'],
		children: [
			{ tag: 'h3', textContent: title },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: help },
			toggleDescriptor(`mail${scope}ForwardEnabled`, `Enable ${title.toLowerCase()} forwarding`),
			targetsDescriptor(`mail${scope}ForwardTargets`),
			toggleDescriptor(`mail${scope}ForwardKeepCopy`, 'Keep a copy in Awtsmoos Mail')
		]
	};
}

/** Returns one bounded multi-destination editor. */
function targetsDescriptor(shaym) {
	return {
		tag: 'label',
		classList: ['mail-settings-field'],
		children: [
			{ tag: 'span', textContent: 'Forward to' },
			{
				tag: 'textarea',
				shaym,
				attributes: {
					rows: '3',
					placeholder: 'name@example.com\nsecond@example.com',
					autocomplete: 'off',
					spellcheck: 'false'
				}
			},
			{ tag: 'small', textContent: 'One per line or comma-separated. Up to 10 effective destinations.' }
		]
	};
}

/** Returns one accessible native-checkbox switch row. */
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
