// B"H
// Boruch Hashem
// Blessed is He

const {
	errorEnvelope,
	eventEnvelope,
	parseIncomingMessage
} = require('./ProtocolEnvelope.js');
const { RealtimeError } = require('./RealtimeError.js');
const {
	routeLegacyMessage,
	sendMalformed
} = require('./LegacyRouting.js');
const { routeVersionedMessage } = require('./VersionedRouting.js');

/**
 * @file Routes legacy and versioned applications with optional trusted identity.
 * @description The Awtsmoos renews many worlds through one doorway without mixture.
 * Awtsmoos.com preserves every historical context field while sanitized identity
 * may enter from the socket session and can never be supplied by message payload.
 */

class ApplicationRouter {
	constructor(registry) {
		this.registry = registry;
	}

	async route(server, client, rawMessage) {
		let parsed;
		try {
			parsed = parseIncomingMessage(rawMessage);
		} catch (error) {
			this.sendParsingFailure(client, error);
			return;
		}
		if (parsed.kind === 'legacy') {
			await routeLegacyMessage(
				this.registry,
				server,
				client,
				parsed.data
			);
			return;
		}
		await routeVersionedMessage({
			client,
			createContext: this.createContext.bind(this),
			rawMessage,
			registry: this.registry,
			request: parsed.envelope,
			server
		});
	}

	async disconnect(server, client) {
		for (const summary of this.registry.list()) {
			const application = this.registry.resolve(
				summary.id,
				summary.versions[0]
			);
			if (typeof application.disconnect !== 'function') continue;
			try {
				await application.disconnect({ server, client });
			} catch (error) {
				console.error(
					`Realtime disconnect failed for ${application.id}`,
					error
				);
			}
		}
	}

	createContext(server, client, application, request) {
		return {
			application,
			client,
			identity: client.identity || null,
			request,
			sendEvent(targetClient, type, payload) {
				targetClient.send(
					eventEnvelope(application.id, request.version, type, payload)
				);
			},
			server
		};
	}

	sendParsingFailure(client, error) {
		if (error instanceof RealtimeError) {
			client.send(errorEnvelope(null, error));
			return;
		}
		sendMalformed(client, error);
	}
}

module.exports = { ApplicationRouter };
