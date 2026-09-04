//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SceneCommandController.js
* @description Owns human scene intent while every actual mutation travels through the shared creative command API.
* The Awtsmoos lets a finger choose a scene without hiding a private state-changing road;
* Awtsmoos.com keeps each click in the same command language that AI, JSON, and scripts have showed.
*/
const EVIDENCE_EVENT = 'awtsmoos-studio:creative-evidence-changed';

/** Coordinates lightweight scene controls without becoming another source of creative truth. */
export class SceneCommandController {
	constructor({
		state,
		api,
		elements,
		eventTarget = globalThis,
		documentRef = globalThis.document,
		setStatus,
		render
	} = {}) {
		this.state = state;
		this.api = api;
		this.elements = elements;
		this.eventTarget = eventTarget;
		this.documentRef = documentRef;
		this.statusWriter = setStatus;
		this.render = render;
		this.boundAdd = () => this.createScene();
		this.boundDuplicate = () => this.duplicateScene();
		this.boundEvidence = () => this.refresh();
		this.isBound = false;
	}

	/** Binds New, Duplicate, and canonical-evidence refresh exactly once. */
	bind() {
		if (this.isBound) {
			return this;
		}
		this.elements?.addScene?.addEventListener?.('click', this.boundAdd);
		this.elements?.duplicateScene?.addEventListener?.('click', this.boundDuplicate);
		this.eventTarget?.addEventListener?.(EVIDENCE_EVENT, this.boundEvidence);
		this.isBound = true;
		this.refresh();
		return this;
	}

	/** Releases transient listeners so repeated lazy Stage mounts cannot double-dispatch commands. */
	dispose() {
		if (!this.isBound) {
			return;
		}
		this.elements?.addScene?.removeEventListener?.('click', this.boundAdd);
		this.elements?.duplicateScene?.removeEventListener?.('click', this.boundDuplicate);
		this.eventTarget?.removeEventListener?.(EVIDENCE_EVENT, this.boundEvidence);
		this.isBound = false;
	}

	/** Reprojects canonical scene truth into the lightweight Stage list. */
	refresh() {
		this.render?.({
			state: this.state,
			elements: this.elements,
			documentRef: this.documentRef,
			onSelect: (sceneId) => this.selectScene(sceneId)
		});
	}

	/** Creates the next friendly scene through the shared project command. */
	createScene() {
		return this.execute(
			'project.scene.create',
			{ name: `Scene ${this.state.scenes.length + 1}` },
			'Scene created.'
		);
	}

	/** Duplicates the current scene through one transactional canonical command. */
	duplicateScene() {
		return this.execute(
			'project.scene.duplicate',
			{ sceneId: this.state.currentSceneId },
			'Scene duplicated.'
		);
	}

	/** Selects one scene through the same editor command available to AI and scripts. */
	selectScene(sceneId) {
		return this.execute(
			'project.scene.select',
			{ sceneId },
			'Scene selected.'
		);
	}

	/** Executes through the public creative API and never falls back to direct scene mutation. */
	async execute(commandId, parameters, successMessage) {
		if (typeof this.api?.execute !== 'function') {
			this.statusWriter?.('Creative command API unavailable.');
			return null;
		}
		try {
			const evidence = await this.api.execute(commandId, parameters, { source: 'human' });
			this.statusWriter?.(successMessage);
			return evidence;
		} catch (error) {
			this.statusWriter?.(error?.message || String(error));
			return null;
		}
	}
}
