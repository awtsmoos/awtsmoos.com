// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieProjectAdvancedActions.js
 * @description Defines project-package, playback, rendering, and 3D handoff commands that remain available through the full API and advanced surfaces.
 * RESPONSIBILITY: preserve non-creative operational action metadata separately from world and node authoring commands.
 * NON-RESPONSIBILITY: this module does not validate packages, render movies, seek playback, or open MitzvahWorld itself.
 * The Awtsmoos carries creation from edit to package and final light; Awtsmoos.com keeps output powers nearby yet out of the beginner's uncluttered sight.
 */

import {
	movieAction,
	movieAreaField,
	movieNumberField
} from './NleMovieActionFields.js';

export const NLE_MOVIE_PROJECT_ADVANCED_ACTIONS = Object.freeze([
	movieAction(
		'project.validate',
		'validate',
		'Package',
		'Validate movie',
		'Compile the complete project and return render-readiness evidence.'
	),
	movieAction(
		'project.exportPackage',
		'exportPackage',
		'Package',
		'Export movie package',
		'Return project, graphs, assets, render plan, request, and validation.'
	),
	movieAction(
		'project.applyPackage',
		'applyPackage',
		'Package',
		'Apply movie package',
		'Validate and apply one complete awtsmoos.movie-package.v1 document.',
		[movieAreaField('source', 'Complete package JSON', '')]
	),
	movieAction(
		'playback.play',
		'play',
		'Playback',
		'Play',
		'Play from the current timeline position.'
	),
	movieAction(
		'playback.pause',
		'pause',
		'Playback',
		'Pause',
		'Pause at the current timeline position.'
	),
	movieAction(
		'playback.seek',
		'seek',
		'Playback',
		'Seek',
		'Move timeline and preview to an exact time.',
		[movieNumberField('time', 'Time', 0, 0, 900)]
	),
	movieAction(
		'movie.render',
		'render',
		'Output',
		'Render movie',
		'Render and download through the verified recorder.'
	),
	movieAction(
		'world.open3D',
		'openWorld',
		'Output',
		'Open 3D World',
		'Open the canonical project in the full MitzvahWorld studio.'
	)
]);
