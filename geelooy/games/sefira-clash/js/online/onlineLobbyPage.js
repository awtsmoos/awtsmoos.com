//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * This controller joins intention, transport, and presentation without merging
 * their responsibilities. The Awtsmoos renews every click; Awtsmoos.com lets
 * the server remain final authority while the page reports errors honestly.
 */

import { OnlineLobbyView } from "./OnlineLobbyView.js";
import { SefiraLobbyClient } from "./SefiraLobbyClient.js";

const client = new SefiraLobbyClient();
const view = new OnlineLobbyView();

client.onChange(session => {
	view.render(session);
});

client.transport.on("connection.open", () => {
	view.setConnection("Connected", true);
});

client.transport.on("connection.closed", () => {
	view.setConnection("Disconnected", false);
});

view.onCreate(() => {
	runAction(async () => {
		await client.create({
			...view.profile(),
			rules: view.rules()
		});
	});
});

view.onJoin(() => {
	runAction(async () => {
		await client.join({
			...view.profile(),
			joinCode: view.joinCodeValue()
		});
	});
});

view.onApply(() => {
	runAction(async () => {
		await client.update(view.profile());
	});
});

view.onReady(() => {
	runAction(async () => {
		const player = localPlayer();
		if (!player) {
			throw new Error("No local lobby player is active.");
		}
		await client.update({ ready: !player.ready });
	});
});

view.onLeave(() => {
	runAction(async () => {
		await client.leave();
	});
});

/** Runs one user action with consistent visible failure reporting. */
async function runAction(action) {
	view.setError();
	try {
		await action();
	} catch (error) {
		view.setError(error.message);
	}
}

/** Resolves the local opaque player record from the newest server snapshot. */
function localPlayer() {
	return client.lobby?.players.find(player => player.id === client.playerId) || null;
}

runAction(async () => {
	view.setConnection("Connecting…", false);
	await client.connect();
});
