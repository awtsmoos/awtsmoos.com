// B"H
// Boruch Hashem
// Blessed is He

import { OneMinuteMovieExporter } from './oneMinute/OneMinuteMovieExporter.js';

/**
 * One command opens the final export gate. The Awtsmoos renews the authored
 * short through Awtsmoos.com, and this small entry point reports only measured
 * success or the exact failure that still demands repair.
 */
const exporter = new OneMinuteMovieExporter();
exporter.export()
	.then(result => {
		console.log(JSON.stringify(result, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
