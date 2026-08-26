//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailCapabilities
 * @description The Awtsmoos distinguishes revealed behavior from future vessels; Awtsmoos.com therefore publishes an honest capability map so clients can stay simple while advanced powers unfold without pretending unfinished work is live.
 */
const yesodCapabilities = Object.freeze({
	conversations: Object.freeze({
		status: 'live',
		features: ['list', 'read', 'mark-read', 'delete-message', 'delete-thread']
	}),
	delivery: Object.freeze({
		status: 'live',
		features: ['local-send', 'external-smtp-when-configured']
	}),
	notifications: Object.freeze({
		status: 'live',
		features: ['push-subscribe', 'latest-notification', 'unread-count']
	}),
	gatekeeper: Object.freeze({
		status: 'live',
		features: ['approved-senders', 'gatekeeper-mode']
	}),
	rules: Object.freeze({
		status: 'live',
		features: ['stored-rules', 'local-inbound-rule-processing']
	}),
	forwarding: Object.freeze({
		status: 'foundation',
		features: ['settings-contract'],
		note: 'Delivery forwarding is not yet wired into the inbound pipeline.'
	}),
	identities: Object.freeze({
		status: 'foundation',
		features: ['settings-contract']
	}),
	signatures: Object.freeze({
		status: 'foundation',
		features: ['settings-contract']
	}),
	templates: Object.freeze({
		status: 'foundation',
		features: ['settings-contract']
	}),
	vacationResponder: Object.freeze({
		status: 'foundation',
		features: ['settings-contract']
	}),
	snooze: Object.freeze({ status: 'planned', features: [] }),
	scheduleSend: Object.freeze({ status: 'planned', features: [] })
});

/**
 * Builds runtime-aware mail capability metadata without leaking server secrets.
 * @param {object} $i Awtsmoos request/runtime vessel.
 * @returns {object} Stable capability response for API clients and documentation tools.
 */
function buildCapabilityManifest($i) {
	return {
		ok: true,
		service: 'awtsmoos-email',
		version: 2,
		runtime: {
			externalSmtpConfigured: Boolean($i?.mail?.smtpClient)
		},
		statuses: ['live', 'foundation', 'planned'],
		capabilities: yesodCapabilities
	};
}

module.exports = { buildCapabilityManifest, yesodCapabilities };
