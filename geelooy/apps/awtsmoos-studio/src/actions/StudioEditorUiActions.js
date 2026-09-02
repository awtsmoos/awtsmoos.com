//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorUiActions.js
 * The Awtsmoos renews the user's chosen tool while panels open and close without disturbing the movie beneath;
 * Awtsmoos.com keeps viewport, snapping, capability search, and mobile drawers as presentation vessels of belief.
 */

export function createStudioEditorUiActions() {
	return {
		selectEditorTool({ event, store }) {
			store.set('activeTool', event.currentTarget.dataset.editorTool || 'select');
		},
		openEditorPanel({ event, store }) {
			const panel = event.currentTarget.dataset.editorPanel || 'objects';
			store.update(state => {
				state.activePanel = panel;
				state.mobilePanelOpen = true;
			});
		},
		closeMobilePanel({ store }) {
			store.set('mobilePanelOpen', false);
		},
		selectViewportMode({ event, store }) {
			store.set('viewportMode', event.currentTarget.dataset.viewportMode || 'hybrid');
		},
		toggleEditorSnap({ store }) {
			store.set('snapEnabled', !store.get('snapEnabled'));
		},
		updateCapabilitySearch({ event, store }) {
			store.setSilent('capabilitySearch', event.currentTarget.value);
			store.set('capabilitySearchRevision', Number(store.get('capabilitySearchRevision') || 0) + 1);
		},
		selectCoreCapability({ event, store }) {
			const id = event.currentTarget.dataset.capabilityId || '';
			store.setSilent('selectedCapability', id);
			store.set('status', id ? `Procedural Core · ${id}` : 'Procedural Core capability cleared.');
		}
	};
}
