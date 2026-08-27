// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimap.js
 * @description Owns compact, expanded, and full-screen quest maps for solo and shared play.
 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws only after
 * movement, unified quest change, peer change, or an explicit remembered viewpoint transition.
 */

import {
	bindWorldMinimapControls,
	updateWorldMinimapControls
} from './WorldMinimapControls.js';
import { projectWorldMinimap } from './WorldMinimapProjection.js';
import {
	ensureWorldMinimapQuestSubscription,
	worldMinimapPeerSignature,
	worldMinimapPlayerPosition
} from './WorldMinimapRuntime.js';
import {
	readWorldMinimapMode,
	writeWorldMinimapMode
} from './WorldMinimapState.js';
import { installWorldMinimapStyle } from './WorldMinimapStyle.js';
import {
	createWorldMinimapRoot,
	renderWorldMinimapMarkers
} from './WorldMinimapView.js';

const MOVEMENT_THRESHOLD = 1.5;

export class WorldMinimap {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.storage = environment.localStorage;
		this.position = worldMinimapPlayerPosition(runtime);
		this.peerSignature = '';
		this.projectionSignature = '';
		this.questSource = null;
		this.unsubscribeQuest = () => {};
		this.mode = readWorldMinimapMode(this.storage);
		installWorldMinimapStyle(documentValue);
		this.root = createWorldMinimapRoot(documentValue, this.mode);
		documentValue.body.appendChild(this.root);
		this.controls = bindWorldMinimapControls(this, documentValue);
		updateWorldMinimapControls(this.root, this.mode);
		ensureWorldMinimapQuestSubscription(this);
		this.render(true);
	}

	refresh() {
		ensureWorldMinimapQuestSubscription(this);
		const position = worldMinimapPlayerPosition(this.runtime);
		const moved = Math.hypot(
			position.x - this.position.x,
			position.z - this.position.z
		) >= MOVEMENT_THRESHOLD;
		const peers = worldMinimapPeerSignature(this.runtime);
		if (!moved && peers === this.peerSignature) return false;
		this.position = position;
		this.peerSignature = peers;
		this.render();
		return true;
	}

	render(force = false) {
		const projection = projectWorldMinimap(this.runtime);
		const signature = JSON.stringify(projection);
		if (!force && signature === this.projectionSignature) return;
		this.projectionSignature = signature;
		this.peerSignature = worldMinimapPeerSignature(this.runtime);
		renderWorldMinimapMarkers(
			this.documentValue,
			this.root.querySelector('[data-map]'),
			projection
		);
		this.lastProjection = projection;
	}

	setMode(mode) {
		this.mode = writeWorldMinimapMode(this.storage, mode);
		this.root.dataset.mode = this.mode;
		this.root.dataset.expanded = String(this.mode !== 'compact');
		updateWorldMinimapControls(this.root, this.mode);
	}

	setExpanded(expanded) {
		this.setMode(expanded ? 'expanded' : 'compact');
	}

	diagnostics() {
		return {
			expanded: this.mode !== 'compact',
			fullscreen: this.mode === 'fullscreen',
			givers: this.lastProjection?.givers?.length || 0,
			mode: this.mode,
			mounted: this.root.isConnected !== false,
			objectives: this.lastProjection?.objectives?.length || 0,
			peers: this.lastProjection?.peers?.length || 0,
			position: { ...this.position }
		};
	}

	destroy() {
		this.unsubscribeQuest();
		this.controls.destroy();
		this.root.remove();
	}
}
