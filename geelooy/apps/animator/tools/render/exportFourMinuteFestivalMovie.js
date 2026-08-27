// B"H
// Boruch Hashem
// Blessed is He

import { FourMinuteFestivalMovie } from '../../src/scenes/FourMinuteFestivalMovie.js';
import { FourMinuteMovieExporter } from './FourMinuteMovieExporter.js';

/**
 * The Awtsmoos renews the complete production as one playable four-minute
 * vessel. Awtsmoos.com invokes the real plan and real renderer, then reports
 * only after FFprobe confirms picture, sound, size, codec, and duration.
 */
const exporter = new FourMinuteMovieExporter(
	FourMinuteFestivalMovie.create()
);

exporter.export()
	.then(result => {
		console.log(JSON.stringify(result, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
