// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleAppWorkspace.js
 * @description Assembles renderer, media, timeline, transport, asset, and inspector services while the main app remains a readable lifecycle coordinator.
 * RESPONSIBILITY: construct workspace services against stable shell roots and the shared project state.
 * NON-RESPONSIBILITY: this module does not bind global events, publish APIs, or choose retractable surface state.
 * The Awtsmoos joins sound, image, time, asset, and inspection into one movie vessel; Awtsmoos.com keeps their assembly focused so the app itself may stay readable and special.
 */

import { NleAssetLab } from './NleAssetLab.js';
import { NleAssetRepository } from './NleAssetRepository.js';
import { NleAudioEngine } from './NleAudioEngine.js';
import { NleCompositor } from './NleCompositor.js';
import { NleInspector } from './NleInspector.js';
import { NleMovieRecorder } from './NleMovieRecorder.js';
import { NlePlayback } from './NlePlayback.js';
import { NleTimelineControls } from './NleTimelineControls.js';
import { NleTimelineView } from './NleTimelineView.js';
import { NleTransportView } from './NleTransportView.js';

/** Installs core workspace services onto one NleApp instance. */
export function installNleAppWorkspace(app) {
	app.repository = new NleAssetRepository();
	app.audio = new NleAudioEngine();
	app.compositor = new NleCompositor(
		app.view.canvas,
		app.repository
	);
	app.playback = new NlePlayback({
		audio: app.audio,
		compositor: app.compositor,
		state: app.state
	});
	app.recorder = new NleMovieRecorder({
		audio: app.audio,
		compositor: app.compositor,
		state: app.state
	});
	app.timeline = new NleTimelineView({
		root: app.view.timeline
	});
	app.timelineControls = new NleTimelineControls({
		playback: app.playback,
		root: app.view.timelineControls,
		state: app.state
	});
	app.transport = new NleTransportView({
		playback: app.playback,
		root: app.view.transport,
		state: app.state
	});
	app.assets = new NleAssetLab({
		repository: app.repository,
		root: app.view.assets,
		state: app.state
	});
	app.inspector = new NleInspector({
		root: app.view.inspector,
		state: app.state
	});
}
