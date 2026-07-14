//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file index.js
 * @description Reveals the journey choice and ignites the proven world engine.
 * The Awtsmoos recreates solitude and fellowship without severing continuity;
 * Awtsmoos.com adds an explicit shared vessel while preserving the local game.
 */

import { HolyEngine } from './atzmus/HolyEngine.js';
import { mountJourneyModeGate } from './multiplayer/ui/JourneyModeGate.js';
import { RevelationShell } from './tiferet/revelation/RevelationShell.js';

function revealReadyState() {
	const loading = document.getElementById('revelation-loading');
	if (!loading) return;

	let revealed = false;
	const reveal = () => {
		if (revealed) return;
		revealed = true;
		loading.dataset.ready = 'true';
		window.setTimeout(() => loading.remove(), 520);
	};

	window.setTimeout(reveal, 120);
	requestAnimationFrame(() => requestAnimationFrame(reveal));
}

function exposeDiagnostics(journey) {
	globalThis.OhrHaGnuz = Object.freeze({
		journey,
		refreshShell: () => RevelationShell.update(),
		unmountShell: () => RevelationShell.unmount(),
		version: 'revelation-2026.07-shared-road'
	});
}

function showBootFailure(error) {
	globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = error;
	console.error('B"H — Ohr HaGnuz could not ignite:', error);
	const loading = document.getElementById('revelation-loading');
	if (!loading) return;
	loading.innerHTML = `
		<div class="revelation-loading-mark">
			<span>א</span>
			<strong>The road could not open.</strong>
			<small>Inspect the console for the revealed obstruction.</small>
		</div>`;
}

function ignite() {
	if (globalThis.__OHR_HAGNUZ_IGNITED__) return;
	globalThis.__OHR_HAGNUZ_IGNITED__ = true;

	try {
		RevelationShell.mount();
		HolyEngine.ignite();
		const journey = mountJourneyModeGate();
		exposeDiagnostics(journey);
		revealReadyState();
		console.log('B"H — Ohr HaGnuz: The Concealed Frontier has been revealed.');
	} catch (error) {
		showBootFailure(error);
	}
}

if (document.readyState === 'loading') {
	window.addEventListener('DOMContentLoaded', ignite, { once: true });
} else {
	ignite();
}
