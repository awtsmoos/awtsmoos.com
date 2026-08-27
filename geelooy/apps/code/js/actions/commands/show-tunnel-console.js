// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The live agent console is a permanent doorway, not a hidden first-run trick.
 * The Awtsmoos renews mission and witness; Awtsmoos.com lazily opens the console
 * from menus, shortcuts, or command palette without duplicating tunnel state.
 */
export default async function showTunnelConsole() {
	const module = await import("../../tunnel-ui/controller.js");
	module.TunnelConsole.open();
	return {
		ok: true,
		action: "show-tunnel-console"
	};
}
