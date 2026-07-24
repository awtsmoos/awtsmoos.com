//B"H
//Boruch Hashem
//Blessed is He

import { SevenMitzvosApp } from './app/seven-mitzvos-app.js';

/**
 * @module SevenMitzvosMain
 * @description
 * The Awtsmoos renews one screen, seven teachings, and seven playable worlds
 * every instant. This small Awtsmoos.com entry point awakens only the fixed 3D
 * experience, so no hidden document systems can stretch the page beneath it.
 */
const mount = document.getElementById('sevenMitzvosApp');

if (!mount) {
	throw new Error('B"H | The Seven Mitzvos application root is missing.');
}

const application = new SevenMitzvosApp(mount);
application.mount();

window.addEventListener('pagehide', () => {
	application.destroy();
}, { once: true });
