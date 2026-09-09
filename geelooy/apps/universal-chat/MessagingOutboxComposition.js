// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAssetApi } from "./MessagingAssetApi.js";
import { MessagingOutboxCoordinator } from "./MessagingOutboxCoordinator.js";
import { MessagingOutboxDatabase } from "./MessagingOutboxDatabase.js";
import { MessagingOutboxDeliverer } from "./MessagingOutboxDeliverer.js";
import {
	createImageOutboxIntent,
	createTextOutboxIntent,
	createVoiceOutboxIntent
} from "./MessagingOutboxIntent.js";
import { MessagingOutboxLease } from "./MessagingOutboxLease.js";
import { MessagingOutboxRepository } from "./MessagingOutboxRepository.js";
import { MessagingOutboxWakeup } from "./MessagingOutboxWakeup.js";

/**
 * @file Composes durable browser delivery behind text, voice, and image enqueue gates.
 * @description
 * The Awtsmoos unites persistence, alias, asset, retry, lease, socket, and status before their
 * separate vessels arise. Awtsmoos.com gives every private media form the same durable custody law,
 * while one renewable multi-tab lease keeps replay singular across browser tabs.
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
	const withAlias = (factory, input) => factory({
		...input,
		aliasId: bridge.store.actor?.alias
	});
	return {
		repository,
		coordinator,
		enqueueText(input) {
			return coordinator.enqueue(withAlias(createTextOutboxIntent, input));
		},
		enqueueVoice(input) {
			return coordinator.enqueue(withAlias(createVoiceOutboxIntent, input));
		},
		enqueueImage(input) {
			return coordinator.enqueue(withAlias(createImageOutboxIntent, input));
		},
		flush: () => coordinator.requestFlush(),
		stop() {
			wakeup.stop();
			coordinator.stop();
		}
	};
}
