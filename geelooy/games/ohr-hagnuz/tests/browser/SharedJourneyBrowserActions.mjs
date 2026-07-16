//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyBrowserActions.mjs
 * @description Drives authenticated character, movement, lamp, battle, and drop.
 * The Awtsmoos renews every chosen act without granting Chrome authority;
 * Awtsmoos.com lets two pages request while the server alone determines truth.
 */

export async function chooseSolo(client) {
	await client.evaluate(`
		document.querySelector('[data-action="solo"]').click();
	`);
	await client.waitFor(
		`document.querySelector('#journey-mode-root').hidden === true`
	);
	return client.evaluate(`({
		shell: Boolean(document.querySelector('#revelation-shell')),
		ignited: Boolean(globalThis.__OHR_HAGNUZ_IGNITED__),
		socket: OhrHaGnuz.journey.connection.socket
	})`);
}

export async function chooseShared(client, displayName, slot) {
	await client.evaluate(`OhrHaGnuz.journey.show()`);
	await client.evaluate(`
		document.querySelector('[data-action="shared"]').click();
	`);
	await client.evaluate(`(() => {
		document.querySelector('[data-field="name"]').value = ${JSON.stringify(displayName)};
		document.querySelector('[data-field="slot"]').value = ${JSON.stringify(slot)};
		document.querySelector('[data-action="connect"]').click();
	})()`);
	await client.waitFor(
		`OhrHaGnuz.journey.store.snapshot().road !== null`,
		10000
	);
	return journeyState(client);
}

export function journeyState(client) {
	return client.evaluate(`OhrHaGnuz.journey.store.snapshot()`);
}

export function playerState(client) {
	return client.evaluate(`(() => {
		const state = OhrHaGnuz.journey.store.snapshot();
		return state.road.players.find(
			player => player.id === state.playerId
		);
	})()`);
}

export async function moveEast(client, steps) {
	for (let index = 0; index < steps; index += 1) {
		await client.evaluate(`
			document.querySelector('[data-move="1,0"]').click();
		`);
		await new Promise(resolve => setTimeout(resolve, 30));
	}
}

export async function lightSharedLamp(client) {
	await client.evaluate(`
		document.querySelector('[data-action="lamp"]').click();
	`);
}

export async function attackVeilWisp(client) {
	await client.evaluate(`
		document.querySelector('[data-action="attack"]').click();
	`);
}

export async function dropSharedSocket(client) {
	await client.evaluate(`(() => {
		const socket = OhrHaGnuz.journey.connection.socket;
		if (!socket) return false;
		socket.close();
		return true;
	})()`);
}
