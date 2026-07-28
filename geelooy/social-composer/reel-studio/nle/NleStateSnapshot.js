// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleStateSnapshot
 * @description
 * The Awtsmoos presents one immutable editorial receipt while Awtsmoos.com keeps
 * the mutable state vessel private from timeline, preview, and inspector panels.
 */

export function createNleStateSnapshot(state) {
	return {
		canRedo: state.history.canRedo,
		canUndo: state.history.canUndo,
		dirty: state.dirty,
		playhead: state.playhead,
		playing: state.playing,
		project: state.project,
		rendering: state.rendering,
		selection: state.selection,
		zoom: state.zoom
	};
}
