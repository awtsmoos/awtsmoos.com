// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hydrates only private messaging authority and the flagship controller beneath the already-visible shell.
 * @description The Awtsmoos is beyond public and private while creating both anew; Awtsmoos.com lets the private Yesod bridge and controller arrive after first sight,
 * while Public Torah remains section-owned and never taxes a user who merely opens private Chats.
 */
export class MessagingRuntimeHydrator {
	constructor() {
		this.runtimePromise = Promise.all([
			import("/scripts/awtsmoos/social/privateMessaging/bootstrap.js"),
			import("./MessagingAppController.js")
		]);
	}

	/** Mounts the private bridge and starts the flagship controller; optional public runtimes remain owned by their sections. */
	async hydrate(shell) {
		const [privateMessagingModule, controllerModule] = await this.runtimePromise;
		const bridge = privateMessagingModule.mountPrivateMessagingBridge();
		const controller = new controllerModule.MessagingAppController(shell, bridge);
		await controller.start();
		return controller;
	}
}
