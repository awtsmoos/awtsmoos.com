// B"H
// Boruch Hashem
// Blessed is He

import { RealisticMinuteMovieExporter } from './realisticMinute/RealisticMinuteMovieExporter.js';

/**
 * One command opens the realistic export gate. The Awtsmoos renews anatomy,
 * object, voice, and camera through Awtsmoos.com, and this entry reports only
 * measured success or the exact defect that still demands a repaired vessel.
 */
const exporter = new RealisticMinuteMovieExporter();
exporter.export()
	.then(result => {
		console.log(JSON.stringify(result, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
