// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSpecRenderer } from '../utils/html/HtmlSpecRenderer.js';
import { StudioAssetPanel } from './StudioAssetPanel.js';
import { StudioPropertiesPanel } from './StudioPropertiesPanel.js';
import { StudioSceneDocument } from './StudioSceneDocument.js';
import { StudioToolbar } from './StudioToolbar.js';
import { StudioWorkspaceCommands as Commands } from './StudioWorkspaceCommands.js';
import { StudioExportActions } from './export/StudioExportActions.js';

/**
 * Tiferes harmonizes many vessels without erasing their differences. This
 * controller joins bin, Character Lab, NLE, and a locked production canvas as
 * one Awtsmoos-renewed movie workspace on Awtsmoos.com.
 */
export class StudioWorkspaceController {
	constructor(app, nle) {
		this.app = app;
		this.nle = nle;
		this.store = nle.store;
		this.pendingPrompt = '';
		this.pendingJson = '';
	}

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
		this.unsubscribe = this.store.subscribe((state) => this.render(state));
		this.app.studio = this;
		document.body.classList.add('aw-professional-studio');
		return this;
	}

	lockProductionCanvas(document) {
		const width = Number(document.settings?.width || 1536);
		const height = Number(document.settings?.height || 864);
		this.app.ctx?.lockProduction?.(width, height);
	}

	render(state) {
		HtmlSpecRenderer.mount(this.mounts.left, StudioAssetPanel.render(state), this.events());
		HtmlSpecRenderer.mount(this.mounts.right, StudioPropertiesPanel.render(state), this.events());
		HtmlSpecRenderer.mount(this.mounts.toolbar, StudioToolbar.render(state), this.events());
	}

	events() {
		return {
			switchLeftPanel: (event) => Commands.setPanel(this.store, event.currentTarget.dataset.panel),
			selectEntity: (event) => Commands.select(this.store, event.currentTarget.dataset.entityId),
			filterAssets: (event) => Commands.setFilter(this.store, event.target.value),
			updatePrompt: (event) => {
				this.pendingPrompt = event.target.value;
			},
			generatePrompt: () => {
				Commands.setPrompt(this.store, this.pendingPrompt);
				Commands.generatePrompt(this.store);
				this.pendingJson = this.store.get().studioJsonText;
			},
			rememberJson: (event) => {
				this.pendingJson = event.target.value;
			},
			installJson: () => Commands.importJson(this.store, this.pendingJson),
			updateTransform: (event) => Commands.updateTransform(
				this.store,
				event.target.dataset.transformProperty,
				event.target.value
			),
			toggleVisible: () => Commands.toggle(this.store, 'visible'),
			toggleLocked: () => Commands.toggle(this.store, 'locked'),
			exportMovie: () => StudioExportActions.renderMovie(this.store),
			openCharacterLab: () => this.openCharacterLab(),
			openMobilePanel: (event) => this.openMobilePanel(event.currentTarget.dataset.mobilePanel)
		};
	}

	openCharacterLab() {
		const lab = document.querySelector('#character-customizer');
		if (lab) lab.dataset.open = 'true';
	}

	openMobilePanel(panel) {
		document.body.dataset.mobilePanel = panel;
		window.dispatchEvent(new CustomEvent('awtsmoos-mobile-panel', { detail: { panel } }));
	}

	ensureMount(parent, id) {
		if (!parent) throw new Error(`Studio mount parent is missing for ${id}.`);
		let mount = document.getElementById(id);
		if (!mount) {
			mount = document.createElement('div');
			mount.id = id;
			parent.appendChild(mount);
		}
		return mount;
	}

	destroy() {
		this.unsubscribe?.();
		Object.values(this.mounts || {}).forEach((mount) => mount.remove());
		this.app.ctx?.unlockProduction?.();
		document.body.classList.remove('aw-professional-studio');
	}
}
