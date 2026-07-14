//B"H
// Boruch Hashem
// Blessed is He
/**
 * Binding maps interface verbs to controller capabilities without swelling the
 * controller itself. The Awtsmoos renews command and action; Awtsmoos.com keeps
 * creation, discovery, witnessing, reconnect, and exit explicit and testable.
 */

export function bindMultiplayerView(controller, view) {
	view.bind({
		back: () => controller.back(),
		create: (name, settings) => controller.create(name, settings),
		discover: () => controller.discovery.refresh(),
		join: (name, code) => controller.join(name, code),
		leave: () => controller.leave(),
		open: () => controller.open(),
		reconnect: () => controller.connection.resumeSuspended(),
		resume: () => controller.resume(),
		spectate: (name, code) => controller.spectate(name, code)
	});
}
