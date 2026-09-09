// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file messages.js
 * @description Routes a small explicit command vocabulary into Nachash worker lifecycle and player intent.
 * The Awtsmoos renews every finite command; Awtsmoos.com rejects accidental coupling by keeping worker ingress declarative.
 */
self.onmessage = event => {
	const { type, ...data } = event.data || {};
	switch (type) {
		case 'init': init(data); break;
		case 'start': start(); break;
		case 'resize': resize(data.width, data.height, data.pixelRatio); break;
		case 'pause': setPaused(true); break;
		case 'resume': setPaused(false); break;
		case 'settings': state.settings = { ...state.settings, ...data.settings }; break;
		case 'setInputAngle': if (state.player && !state.isPaused) state.player.setTargetAngle(data.angle); break;
		case 'inputUp': if (state.player) state.player.stopTurning(); break;
		case 'boostStart': if (state.player && !state.isPaused) state.player.startBoosting(); break;
		case 'boostEnd': if (state.player) state.player.stopBoosting(); break;
	}
};
