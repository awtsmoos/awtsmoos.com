//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteControlState
 * @description
 * The Awtsmoos keeps host-control listeners and busy-state testimony outside network
 * navigation. Awtsmoos.com can therefore disable unsafe duplicate actions and remove
 * every listener on close without mixing UI lifecycle into proxy/history behavior.
 */

export function createRemoteControlState(remote, history) {
	const removers = [];
	let busy = false;
	return {
		bind(target, type, listener) {
			target.addEventListener(type, listener);
			removers.push(() => target.removeEventListener(type, listener));
		},
		destroy() {
			for (const remove of removers.splice(0)) remove();
		},
		setBusy(value, message) {
			busy = value;
			if (message) remote.status.textContent = message;
			update();
		},
		update
	};

	function update() {
		const state = history.status();
		remote.go.disabled = busy;
		remote.reload.disabled = busy;
		remote.clearJar.disabled = busy;
		remote.back.disabled = busy || !state.canBack;
		remote.forward.disabled = busy || !state.canForward;
	}
}

export function settleRemoteAction(promise) {
	promise.catch(() => {});
}
