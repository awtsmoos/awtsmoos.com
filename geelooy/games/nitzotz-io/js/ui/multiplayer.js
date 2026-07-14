// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renders a truthful local-room covenant. The label never implies an
 * internet server, and peer presence remains observational rather than authoritative.
 */
export function renderMultiplayerPanel(world, dom) {
	const state = world.multiplayer;
	dom.roomInput.value = state.room;
	dom.roomStatus.textContent = state.supported
		? `${state.connected ? 'CONNECTED' : 'READY'} · ${state.peerCount} SAME-DISTRICT PEERS · ${state.packetsReceived} RX`
		: 'BROADCASTCHANNEL IS NOT AVAILABLE IN THIS BROWSER';
	dom.roomButton.disabled = !state.supported;
	dom.roomButton.textContent = state.connected ? 'REJOIN LOCAL ROOM' : 'JOIN LOCAL ROOM';
}

/** Bind room changes by button or Enter without adding another global listener. */
export function bindMultiplayerPanel(dom, actions) {
	const join = () => {
		const room = actions.setRoom(dom.roomInput.value);
		dom.roomInput.value = room;
	};
	dom.roomButton.addEventListener('click', join);
	dom.roomInput.addEventListener('keydown', event => {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		join();
	});
}
