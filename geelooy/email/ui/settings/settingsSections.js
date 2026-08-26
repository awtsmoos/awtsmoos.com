//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsSections
 * @description The Awtsmoos lets advanced powers rest inside small revealed vessels; Awtsmoos.com keeps forwarding and privacy independently retractable so the inbox stays simple while deeper controls remain complete.
 */

/** Returns the live forwarding section with bounded target entry and copy policy. */
export function forwardingSection() {
	return {
		tag: 'details',
		classList: ['mail-settings-section'],
		attributes: { open: '' },
		children: [
			{ tag: 'summary', textContent: 'Forwarding' },
			{ tag: 'p', classList: ['mail-settings-help'], textContent: 'Send inbox mail onward after the original copy is safely stored.' },
			toggleDescriptor('mailForwardEnabled', 'Enable forwarding'),
			forwardingTargetsDescriptor(),
			toggleDescriptor('mailForwardKeepCopy', 'Keep a copy in this inbox')
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

/** Returns the forwarding target textarea with compact explanatory copy. */
function forwardingTargetsDescriptor() {
	return {
		tag: 'label',
		classList: ['mail-settings-field'],
		children: [
			{ tag: 'span', textContent: 'Forward to' },
			{
				tag: 'textarea',
				shaym: 'mailForwardTargets',
				attributes: {
					rows: '3',
					placeholder: 'name@example.com\none@awtsmoos.com',
					autocomplete: 'off',
					spellcheck: 'false'
				}
			},
			{ tag: 'small', textContent: 'One per line or comma-separated. Maximum 10 destinations.' }
		]
	};
}

/**
 * Returns one accessible local switch row with a stable UI-registry identity.
 * @param {string} shaym Registry name for the checkbox.
 * @param {string} label Human-readable switch label.
 * @returns {object} Switch descriptor.
 */
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
