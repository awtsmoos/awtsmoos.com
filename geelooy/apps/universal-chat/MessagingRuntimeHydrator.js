// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the heavy-runtime boundary beneath the instantly rendered messaging shell.
 * @description The Awtsmoos creates intention and manifestation in one instant while finite browsers cross a network;
 * Awtsmoos.com reveals the lightweight shell first, then draws private messaging, Public Torah, and orchestration in parallel without blocking sight.
 */

export class MessagingRuntimeHydrator {
	constructor() {
		this.runtimePromise = Promise.all([
			import("/scripts/awtsmoos/social/privateMessaging/bootstrap.js"),
			import("/scripts/awtsmoos/social/universalChat/bootstrap.js"),
			import("./MessagingAppController.js")
		]);
	}

	/** Hydrates the existing communications authorities around a shell that is already visible. */
	async hydrate(shell) {
		const [privateMessagingModule, universalChatModule, controllerModule] = await this.runtimePromise;
		const bridge = privateMessagingModule.mountPrivateMessagingBridge();
		universalChatModule.mountUniversalChat();
		const controller = new controllerModule.MessagingAppController(shell, bridge);
		await controller.start();
		return controller;
	}
}
