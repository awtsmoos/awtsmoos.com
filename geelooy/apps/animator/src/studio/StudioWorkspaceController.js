// B"H
// Boruch Hashem
// Blessed is He

import { ResponsiveChrome } from '../ui/chrome/ResponsiveChrome.js';
import { HtmlSpecRenderer } from '../utils/html/HtmlSpecRenderer.js';
import { StudioExportActions } from './export/StudioExportActions.js';
import { StudioAssetPanel } from './StudioAssetPanel.js';
import { StudioPenToolController } from './vector/StudioPenToolController.js';
import { StudioPropertiesPanel } from './StudioPropertiesPanel.js';
import { StudioSceneDocument } from './StudioSceneDocument.js';
import { StudioToolbar } from './StudioToolbar.js';
import { StudioWorkspaceCommands as Commands } from './StudioWorkspaceCommands.js';
import { StudioWorkspaceEvents } from './StudioWorkspaceEvents.js';
import { StudioWorkspaceMounts } from './StudioWorkspaceMounts.js';

/**
 * @module StudioWorkspaceController
 * @description
 * The Awtsmoos renews stage, inspector, Pen, timeline, and toolbar before one workspace lifecycle can begin;
 * Awtsmoos.com keeps one responsive truth while gestures, export, and authored state each receive a focused vessel within.
 */
export class StudioWorkspaceController {
	constructor(app, nle) {
		this.app = app;
		this.nle = nle;
		this.store = nle.store;
		this.pendingPrompt = '';
		this.pendingJson = '';
	}

	/** Installs the canonical Studio document, production canvas, Pen tool, mounts, and render subscription. */
	install() {
		const sceneDocument = StudioSceneDocument.fromMoviePlan(this.nle.moviePlan);
		Commands.initialize(this.store, sceneDocument);
		this.lockProductionCanvas(sceneDocument);
		this.store.set({ mode: window.innerWidth <= 780 ? 'compact' : 'expanded' });
		this.mounts = StudioWorkspaceMounts.create();
		this.pendingPrompt = this.store.get().studioPrompt;
		this.pendingJson = this.store.get().studioJsonText;
		this.boundEvents = StudioWorkspaceEvents.create(this);
		this.penTool = new StudioPenToolController(this.app, this.store).install();
		this.app.studio = this;
		document.body.classList.add('aw-professional-studio');
		this.unsubscribe = this.store.subscribe((state) => this.render(state));
		return this;
	}

	/** Locks the production surface to the project document's authored dimensions. */
	lockProductionCanvas(document) {
		const width = Number(document.settings?.width || 1536);
		const height = Number(document.settings?.height || 864);
		this.app.ctx?.lockProduction?.(width, height);
	}

	/** Re-renders focused workspace mounts from one current store snapshot. */
	render(state) {
		HtmlSpecRenderer.mount(this.mounts.left, StudioAssetPanel.render(state), this.boundEvents);
		HtmlSpecRenderer.mount(this.mounts.right, StudioPropertiesPanel.render(state), this.boundEvents);
		HtmlSpecRenderer.mount(this.mounts.toolbar, StudioToolbar.render(state), this.boundEvents);
	}

	/** Runs the established MP4 export pipeline without duplicating export state. */
	exportMovie() {
		return StudioExportActions.renderMovie(this.store);
	}

	/** Opens the existing Character Lab using its current DOM contract. */
	openCharacterLab() {
		const lab = document.querySelector('#character-customizer');
		if (lab) {
			lab.dataset.open = 'true';
		}
	}

	/** Routes every Studio drawer command through the existing responsive chrome source of truth. */
	openMobilePanel(panel) {
		ResponsiveChrome.setPanel(panel);
	}

	/** Removes Studio-owned listeners/mounts and restores the production canvas lifecycle. */
	destroy() {
		this.penTool?.destroy();
		this.unsubscribe?.();
		StudioWorkspaceMounts.remove(this.mounts);
		this.app.ctx?.unlockProduction?.();
		if (this.app.studio === this) {
			delete this.app.studio;
		}
		document.body.classList.remove('aw-professional-studio');
	}
}
