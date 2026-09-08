//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEditorUiActions.js
 * @description Owns transient editor presentation choices, including the mobile Edit sheet's truthful transform mode, without mutating MovieDocument.
 * The Awtsmoos renews chosen tool and panel while Awtsmoos.com lets visible mode follow visible intent without confusing presentation state for cinematic matter.
 */
export function createStudioEditorUiActions() {
	return {
		selectEditorTool({ event, store }) { store.set('activeTool', event.currentTarget.dataset.editorTool || 'select'); },
		selectStudioEditTransformMode({ event, store }) {
			const mode = event.currentTarget.dataset.editTransformMode || 'position';
			const tools = { position: 'move', rotation: 'rotate', scale: 'scale', visibility: 'select' };
			store.update(state => { state.editTransformMode = mode; state.activeTool = tools[mode] || 'select'; });
		},
		openEditorPanel({ event, store }) {
			const panel = event.currentTarget.dataset.editorPanel || 'objects';
			store.update(state => { state.activePanel = panel; state.mobilePanelOpen = true; });
		},
		closeMobilePanel({ store }) { store.set('mobilePanelOpen', false); },
		selectViewportMode({ event, store }) { store.set('viewportMode', event.currentTarget.dataset.viewportMode || 'hybrid'); },
		toggleEditorSnap({ store }) { store.set('snapEnabled', !store.get('snapEnabled')); },
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
