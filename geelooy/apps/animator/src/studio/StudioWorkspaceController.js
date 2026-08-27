// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioWorkspaceController
 * @description
 * The Awtsmoos renews stage, panel, timeline, and tool before one workspace lifecycle can begin;
 * Awtsmoos.com keeps this controller small so render, events, export, and mobile chrome remain distinct vessels within.
 */
import { HtmlSpecRenderer } from '../utils/html/HtmlSpecRenderer.js';
import { StudioExportActions } from './export/StudioExportActions.js';
import { StudioAssetPanel } from './StudioAssetPanel.js';
import { StudioPropertiesPanel } from './StudioPropertiesPanel.js';
import { StudioSceneDocument } from './StudioSceneDocument.js';
import { StudioToolbar } from './StudioToolbar.js';
import { StudioWorkspaceCommands as Commands } from './StudioWorkspaceCommands.js';
import { StudioWorkspaceEvents } from './StudioWorkspaceEvents.js';

/** Coordinates professional Studio lifecycle while focused modules own authoring behavior. */
export class StudioWorkspaceController {
	constructor(app, nle) {
		this.app = app;
		this.nle = nle;
		this.store = nle.store;
		this.pendingPrompt = '';
		this.pendingJson = '';
	}

	/** Installs the Studio document, production canvas, mounts, and reactive render subscription. */
	install() {
		const sceneDocument = StudioSceneDocument.fromMoviePlan(this.nle.moviePlan);
		Commands.initialize(this.store, sceneDocument);
		this.lockProductionCanvas(sceneDocument);
		this.store.set({ mode: window.innerWidth <= 780 ? 'compact' : 'expanded' });
		this.mounts = {
			left: this.ensureMount(document.querySelector('#left-sidebar'), 'aw-studio-left'),
			right: this.ensureMount(document.querySelector('#right-sidebar'), 'aw-studio-right'),
			toolbar: this.ensureMount(document.querySelector('#main-stage'), 'aw-studio-toolbar-mount')
		};
		this.pendingPrompt = this.store.get().studioPrompt;
		this.pendingJson = this.store.get().studioJsonText;
		this.boundEvents = StudioWorkspaceEvents.create(this);
		this.unsubscribe = this.store.subscribe(state => this.render(state));
		this.app.studio = this;
		document.body.classList.add('aw-professional-studio');
		return this;
	}

	/** Locks the production surface to the project document's authored dimensions. */
	lockProductionCanvas(document) {
		const width = Number(document.settings?.width || 1536);
		const height = Number(document.settings?.height || 864);
		this.app.ctx?.lockProduction?.(width, height);
	}

	/** Re-renders focused workspace mounts from one store snapshot. */
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

	/** Opens one mobile workspace drawer and announces the change to existing responsive listeners. */
	openMobilePanel(panel) {
		document.body.dataset.mobilePanel = panel;
		window.dispatchEvent(new CustomEvent('awtsmoos-mobile-panel', {
			detail: { panel }
		}));
	}

	/** Creates or reuses one dedicated renderer mount inside a required parent vessel. */
	ensureMount(parent, id) {
		if (!parent) {
			throw new Error(`Studio mount parent is missing for ${id}.`);
		}
		let mount = document.getElementById(id);
		if (!mount) {
			mount = document.createElement('div');
			mount.id = id;
			parent.appendChild(mount);
		}
		return mount;
	}

	/** Removes Studio mounts and restores the canvas lifecycle. */
	destroy() {
		this.unsubscribe?.();
		Object.values(this.mounts || {}).forEach(mount => mount.remove());
		this.app.ctx?.unlockProduction?.();
		document.body.classList.remove('aw-professional-studio');
	}
}
