// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineViewOperations.js
 * @description Installs selection, command, snapping, scale, time, tool, and blade operations on one timeline view.
 * The Awtsmoos is beyond method and vessel while each finite operation receives a bounded place;
 * Awtsmoos.com keeps the view constructor small and every timeline behavior explicit in grace.
 */

import { clampTimelineScale } from './MovieTimelineGeometry.js';
import {
	refreshMovieTimelineCommands,
	renderMovieTimeline,
	setMovieTimelineTime
} from './MovieTimelineRenderer.js';
import {
	bladeMovieTimelineClip,
	setMovieTimelineViewTool
} from './MovieTimelineToolActions.js';
import { fitTimelineScale } from './MovieTimelineViewport.js';
import { captureTimelineZoomAnchor } from './MovieTimelineZoomState.js';

export function installMovieTimelineViewOperations(view) {
	view.render = function render() {
		renderMovieTimeline(view);
	};
	view.select = function select(value) {
		if (value.selectionSet) view.editor.setSelection(value.selectionSet);
		view.selection = view.editor.selection.primary;
		view.onSelect?.({ ...value, selectionSet: view.editor.selection });
		view.updateCommands();
	};
	view.setSelection = function setSelection(selection) {
		view.editor.setSelection(selection);
		view.selection = view.editor.selection.primary;
		view.updateCommands();
	};
	view.runCommand = function runCommand(name, payload = {}) {
		return view.onCommand?.(name, payload);
	};
	view.commandState = function commandState() {
		return view.getCommandState?.() || {};
	};
	view.updateCommands = function updateCommands() {
		refreshMovieTimelineCommands(view);
	};
	view.snapContext = function snapContext() {
		return {
			enabled: view.snapping,
			playhead: view.currentTime,
			project: view.project,
			threshold: 8 / view.scale
		};
	};
	view.fit = function fit() {
		view.setScale(fitTimelineScale(view.shell, view.project.duration));
	};
	view.setScale = function setScale(value, clientX) {
		view.zoomAnchor = captureTimelineZoomAnchor(view, clientX);
		view.scale = clampTimelineScale(value);
		view.render();
		return view.scale;
	};
	view.setTime = function setTime(time) {
		setMovieTimelineTime(view, time);
	};
	view.setTool = function setTool(value) {
		return setMovieTimelineViewTool(view, value);
	};
	view.blade = function blade(track, clip, event) {
		return bladeMovieTimelineClip(view, track, clip, event);
	};
}
