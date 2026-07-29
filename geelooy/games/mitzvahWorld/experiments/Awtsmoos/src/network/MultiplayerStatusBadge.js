// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusBadge.js
 * @description Mounts one accessible badge for actual play mode and realtime condition.
 * The Awtsmoos turns hidden transport into visible testimony; Awtsmoos.com keeps DOM ownership
 * separate from copy and style so every connection state can be tested without a browser.
 */

import {
	multiplayerDetailLabel,
	multiplayerStateLabel,
	multiplayerStatusIsHealthy,
	normalizeMultiplayerStatus
} from './MultiplayerStatusBadgeCopy.js';
import { installMultiplayerStatusStyle } from './MultiplayerStatusBadgeStyle.js';

const BADGE_ID = 'AwtsmoosRealtimeStatus';
const STYLE_ID = 'AwtsmoosRealtimeStatusStyle';

export class MultiplayerStatusBadge {
	constructor(root = globalThis.document?.body) {
		this.root = root;
		this.document = root?.ownerDocument || globalThis.document;
		this.element = null;
		this.modeNode = null;
		this.stateNode = null;
		this.detailNode = null;
		this.lastKey = '';
		this.current = null;
		this.mount();
	}
	setStatus(status = {}) {
		const normalized = normalizeMultiplayerStatus(status);
		const key = JSON.stringify(normalized);
		this.current = normalized;
		if (!this.element || key === this.lastKey) return normalized;
		this.lastKey = key;
		this.element.dataset.mode = normalized.mode;
		this.element.dataset.peerCount = String(normalized.peerCount);
		this.element.dataset.state = normalized.state;
		this.element.dataset.transport = normalized.transport;
		this.element.dataset.healthy = String(multiplayerStatusIsHealthy(normalized));
		this.modeNode.textContent = normalized.mode === 'singleplayer'
			? 'SINGLEPLAYER'
			: 'MULTIPLAYER';
		this.stateNode.textContent = multiplayerStateLabel(normalized);
		this.detailNode.textContent = multiplayerDetailLabel(normalized);
		return normalized;
	}
	snapshot() {
		return this.current ? { ...this.current } : null;
	}
	destroy() {
		this.element?.remove();
		this.element = null;
	}
	mount() {
		if (!this.root || !this.document?.createElement) return;
		installMultiplayerStatusStyle(this.document, STYLE_ID);
		this.document.getElementById?.(BADGE_ID)?.remove();
		const element = this.document.createElement('aside');
		element.id = BADGE_ID;
		element.className = 'Awtsmoos-realtime-status';
		element.setAttribute('aria-live', 'polite');
		element.setAttribute('aria-label', 'Realtime multiplayer connection');
		const signal = this.document.createElement('span');
		signal.className = 'Awtsmoos-realtime-signal';
		signal.setAttribute('aria-hidden', 'true');
		const copy = this.document.createElement('span');
		copy.className = 'Awtsmoos-realtime-copy';
		this.modeNode = this.document.createElement('small');
		this.stateNode = this.document.createElement('strong');
		this.detailNode = this.document.createElement('span');
		copy.append(this.modeNode, this.stateNode, this.detailNode);
		element.append(signal, copy);
		this.root.append(element);
		this.element = element;
	}
}

export function installSinglePlayerStatusBadge(root = globalThis.document?.body) {
	const badge = new MultiplayerStatusBadge(root);
	badge.setStatus({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	return badge;
}
