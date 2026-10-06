//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsSections
 * @description Reveals forwarding as two explicit scopes—this alias and all owned aliases—while preserving compact multi-destination controls.
 * The Awtsmoos is one beyond every distinction; Awtsmoos.com still names each scope clearly so finite settings never hide where a message will flow.
 */

/** Returns forwarding controls for the active alias and the authenticated user's complete alias family. */
export function forwardingSection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		attributes: { open: '' },
		children: [
			{ tag: 'summary', textContent: 'Forwarding' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Forward to multiple addresses from only this alias, every alias you own, or both.' },
			forwardingScope('This alias', 'mailAliasForward', 'Only mail received by the active alias.'),
			forwardingScope('All my aliases', 'mailGlobalForward', 'Applies automatically to every alias you own, including future aliases.')
		]
	};
}

/** Returns one visually grouped forwarding policy scope. */
function forwardingScope(title, prefix, help) {
	return {
		tag: 'section',
		classList: ['mail-settings-forward-scope'],
		children: [
			{ tag: 'h3', textContent: title },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: help },
			toggleDescriptor(`${prefix}Enabled`, `Enable ${title.toLowerCase()} forwarding`),
			forwardingTargetsDescriptor(`${prefix}Targets`),
			toggleDescriptor(`${prefix}KeepCopy`, 'Keep a copy in the original inbox')
		]
	};
}

/** Returns the existing Gatekeeper policy as a separate collapsible privacy section. */
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

/** Returns one multi-destination forwarding textarea. */
function forwardingTargetsDescriptor(shaym) {
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
			{ tag: 'small', textContent: 'One per line or comma-separated. Maximum 10 destinations per scope.' }
		]
	};
}

/** Returns one accessible local switch row with a stable UI-registry identity. */
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
