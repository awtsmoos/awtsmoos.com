//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * One doorway may serve many worlds when every packet knows its destination.
 * The Awtsmoos renews all applications without mixture; Awtsmoos.com routes
 * legacy garments unchanged and versioned requests through measured boundaries.
 */

const {
	errorEnvelope,
	eventEnvelope,
	parseIncomingMessage
} = require("./ProtocolEnvelope.js");
const { RealtimeError } = require("./RealtimeError.js");
const {
	routeLegacyMessage,
	sendMalformed
} = require("./LegacyRouting.js");
const { routeVersionedMessage } = require("./VersionedRouting.js");

/** Routes legacy and versioned messages through registered applications. */
class ApplicationRouter {
	constructor(registry) {
		this.registry = registry;
	}

	/** Routes one complete text message. */
	async route(server, client, rawMessage) {
		let parsed;
		try {
			parsed = parseIncomingMessage(rawMessage);
		} catch (error) {
			this.sendParsingFailure(client, error);
			return;
		}

		if (parsed.kind === "legacy") {
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

	/** Invokes every registered application's optional disconnect hook. */
	async disconnect(server, client) {
		for (const summary of this.registry.list()) {
			const application = this.registry.resolve(
				summary.id,
				summary.versions[0]
			);
			if (typeof application.disconnect !== "function") {
				continue;
			}
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

	/** Creates an application-scoped request context. */
	createContext(server, client, application, request) {
		return {
			application,
			client,
			request,
			sendEvent(targetClient, type, payload) {
				targetClient.send(
					eventEnvelope(application.id, request.version, type, payload)
				);
			},
			server
		};
	}

	/** Preserves malformed legacy JSON while structuring versioned validation. */
	sendParsingFailure(client, error) {
		if (error instanceof RealtimeError) {
			client.send(errorEnvelope(null, error));
			return;
		}
		sendMalformed(client, error);
	}
}

module.exports = {
	ApplicationRouter
};
