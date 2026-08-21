// B"H
// Boruch Hashem
// Blessed is He

import { StudioAuthoringCommands as Authoring } from './authoring/StudioAuthoringCommands.js';
import { StudioProceduralCommands as Procedural } from './procedural/StudioProceduralCommands.js';
import { StudioWorkspaceCommands as Workspace } from './StudioWorkspaceCommands.js';

/**
 * @module StudioWorkspaceEvents
 * @description
 * The Awtsmoos renews each gesture before button, field, seed, keyframe, or touch can become project intention;
 * Awtsmoos.com keeps DOM events as a thin shell around explicit commands so manual and generated art share one truthful dimension.
 */
export class StudioWorkspaceEvents {
	/** Creates the HtmlSpec event map for one professional Studio workspace controller. */
	static create(controller) {
		const store = controller.store;
		const openLeftPanel = (panel) => {
			Workspace.setPanel(store, panel);
			controller.openMobilePanel('editor');
		};
		return {
			switchLeftPanel: (event) => Workspace.setPanel(store, event.currentTarget.dataset.panel),
			selectEntity: (event) => Workspace.select(store, event.currentTarget.dataset.entityId),
			filterAssets: (event) => Workspace.setFilter(store, event.target.value),
			updatePrompt: (event) => {
				controller.pendingPrompt = event.target.value;
			},
			generatePrompt: () => {
				Workspace.setPrompt(store, controller.pendingPrompt);
				Workspace.generatePrompt(store);
			},
			applyPrompt: () => Workspace.applyPrompt(store),
			discardPrompt: () => Workspace.discardPrompt(store),
			rememberJson: (event) => {
				controller.pendingJson = event.target.value;
			},
			installJson: () => Workspace.importJson(store, controller.pendingJson),
			updateTransform: (event) => Workspace.updateTransform(
				store,
				event.target.dataset.transformProperty,
				event.target.value
			),
			updateProceduralParameter: (event) => Procedural.updateParameter(
				store,
				event.target.dataset.proceduralParam,
				event.target.value
			),
			updateProceduralSeed: (event) => Procedural.updateSeed(store, event.target.value),
			regenerateProcedural: () => Procedural.regenerate(store),
			randomizeProceduralSeed: () => Procedural.randomizeSeed(store),
			resetProcedural: () => Procedural.reset(store),
			freezeProcedural: () => Procedural.freeze(store),
			toggleVisible: () => Workspace.toggle(store, 'visible'),
			toggleLocked: () => Workspace.toggle(store, 'locked'),
			addRectangle: () => Authoring.addRectangle(store),
			addEllipse: () => Authoring.addEllipse(store),
			addText: () => Authoring.addText(store),
			addNature: (event) => Authoring.addNature(store, event.currentTarget.dataset.natureKind),
			addStudioKeyframe: () => Authoring.addKeyframe(store),
			duplicateSelected: () => Authoring.duplicate(store),
			removeSelected: () => Authoring.remove(store),
			moveLayerForward: () => Authoring.moveForward(store),
			moveLayerBackward: () => Authoring.moveBackward(store),
			undo: () => Authoring.undo(store),
			redo: () => Authoring.redo(store),
			openAssetsPanel: () => openLeftPanel('assets'),
			openLayersPanel: () => openLeftPanel('layers'),
			openCreatePanel: () => openLeftPanel('create'),
			openAiPanel: () => openLeftPanel('ai'),
			openPropertiesPanel: () => controller.openMobilePanel('props'),
			openTimelinePanel: () => controller.openMobilePanel('time'),
			exportMovie: () => controller.exportMovie(),
			openCharacterLab: () => controller.openCharacterLab(),
			openMobilePanel: (event) => controller.openMobilePanel(event.currentTarget.dataset.mobilePanel)
		};
	}
}
