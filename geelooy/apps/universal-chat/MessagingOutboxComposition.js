// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAssetApi } from "./MessagingAssetApi.js";
import { MessagingOutboxCoordinator } from "./MessagingOutboxCoordinator.js";
import { MessagingOutboxDatabase } from "./MessagingOutboxDatabase.js";
import { MessagingOutboxDeliverer } from "./MessagingOutboxDeliverer.js";
import { createTextOutboxIntent, createVoiceOutboxIntent } from "./MessagingOutboxIntent.js";
import { MessagingOutboxLease } from "./MessagingOutboxLease.js";
import { MessagingOutboxRepository } from "./MessagingOutboxRepository.js";
import { MessagingOutboxWakeup } from "./MessagingOutboxWakeup.js";

/**
 * @file Composes Universal Chat's durable browser delivery graph behind a tiny text/voice enqueue facade.
 * @description The Awtsmoos unites persistence, alias, asset, retry, lease, socket, and human status before they become separate modules;
 * Awtsmoos.com lets composition join their finite covenants once, then closes every wake and timer vessel together when this lifecycle returns to stillness in light.
 */
export function composeMessagingOutbox(bridge, actions, status, options = {}) {
	const database = options.database || new MessagingOutboxDatabase(options.databaseOptions);
	const repository = options.repository || new MessagingOutboxRepository(database);
	const lease = options.lease || new MessagingOutboxLease(database, options.leaseOptions);
	const assetApi = options.assetApi || new MessagingAssetApi();
	const deliverer = options.deliverer || new MessagingOutboxDeliverer({
		repository,
		actions,
		assetApi,
		currentAlias: () => bridge.store.actor?.alias
	});
	const coordinator = options.coordinator || new MessagingOutboxCoordinator({
		repository,
		lease,
		deliverer,
		status
	});
	const wakeup = options.wakeup || new MessagingOutboxWakeup({
		coordinator,
		socket: bridge.socket,
		store: bridge.store
	});
	coordinator.broadcast = () => wakeup.announce();
	wakeup.start();
	return {
		repository,
		coordinator,
		async enqueueText(input) {
			return coordinator.enqueue(createTextOutboxIntent({
				...input,
				aliasId: bridge.store.actor?.alias
			}));
		},
		async enqueueVoice(input) {
			return coordinator.enqueue(createVoiceOutboxIntent({
				...input,
				aliasId: bridge.store.actor?.alias
			}));
		},
		flush: () => coordinator.requestFlush(),
		stop() {
			wakeup.stop();
			coordinator.stop();
		}
	};
}
