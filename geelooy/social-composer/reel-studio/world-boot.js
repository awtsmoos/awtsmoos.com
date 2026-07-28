// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialNleWorldBoot
 * @description
 * The optional window imports the current real MitzvahWorld movie studio with
 * the same project saved by the responsive NLE, leaving the editing shell fast.
 */

import { readNleWorldProject } from './nle/NleWorldPreview.js';
import { createMovieStudio } from '/games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieStudio.js';

const project = readNleWorldProject();
if (!project) throw new Error('No NLE movie project was supplied to the 3D preview.');

const hosts = {
	actions: document.getElementById('actions'),
	canvas: document.getElementById('AwtsmoosCanvas'),
	hud: document.getElementById('hud'),
	inventory: document.getElementById('inventory'),
	joy: document.getElementById('joy'),
	jump: document.getElementById('jump'),
	npcDialogue: document.getElementById('npcDialogue'),
	npcTarget: document.getElementById('npcTarget')
};

try {
	await createMovieStudio({ hosts, project });
} catch (error) {
	document.getElementById('loadingMessage').textContent = `3D preview failed: ${error.message}`;
	console.error('[MitzvahWorld 3D Preview]', error);
}
