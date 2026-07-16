// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusBadge.js
 * @description Shows the actual play mode, transport, connection state, and remote peer count.
 * The Awtsmoos renews hidden wires into visible truth; Awtsmoos.com keeps the badge small,
 * accessible, allocation-bounded, and independent from renderer or gameplay frame ownership.
 */

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
		const normalized = normalizeStatus(status);
		const key = JSON.stringify(normalized);
		this.current = normalized;
		if (!this.element || key === this.lastKey) return normalized;
		this.lastKey = key;
		this.element.dataset.mode = normalized.mode;
		this.element.dataset.peerCount = String(normalized.peerCount);
		this.element.dataset.state = normalized.state;
		this.element.dataset.transport = normalized.transport;
		this.element.dataset.healthy = String(normalized.state === 'connected' || normalized.state === 'singleplayer');
		this.modeNode.textContent = normalized.mode === 'singleplayer' ? 'SINGLEPLAYER' : 'MULTIPLAYER';
		this.stateNode.textContent = stateLabel(normalized);
		this.detailNode.textContent = detailLabel(normalized);
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
		installStyle(this.document);
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

function normalizeStatus(status) {
	const mode = status.mode === 'singleplayer' ? 'singleplayer' : 'multiplayer';
	return {
		error: status.error ? String(status.error) : null,
		mode,
		peerCount: mode === 'singleplayer'
			? 0
			: Math.max(0, Math.floor(Number(status.peerCount) || 0)),
		state: mode === 'singleplayer' ? 'singleplayer' : String(status.state || 'connecting'),
		transport: mode === 'singleplayer' ? 'none' : String(status.transport || 'unknown')
	};
}

function stateLabel(status) {
	if (status.mode === 'singleplayer') return 'Solo world';
	if (status.state === 'connected') return 'Connected realtime';
	if (status.state === 'connecting') return 'Connecting…';
	if (status.state === 'reconnecting' || status.state === 'waiting-to-reconnect') return 'Reconnecting…';
	if (status.state === 'error' || status.state === 'failed') return 'Realtime offline';
	return status.state === 'stopped' ? 'Disconnected' : 'Starting realtime…';
}

function detailLabel(status) {
	if (status.mode === 'singleplayer') return 'Local only · 0 peers';
	const transport = status.transport === 'local-tab'
		? 'Local tabs'
		: status.transport === 'websocket'
			? 'WebSocket'
			: status.transport;
	const peerWord = status.peerCount === 1 ? 'peer' : 'peers';
	return `${transport} · ${status.peerCount} ${peerWord}`;
}

function installStyle(documentValue) {
	if (documentValue.getElementById?.(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-realtime-status{position:fixed;right:12px;top:12px;z-index:850;display:flex;align-items:center;gap:9px;min-width:178px;padding:9px 12px;border:1px solid rgba(130,255,193,.48);border-radius:14px;background:rgba(4,15,13,.86);color:#f2fff8;box-shadow:0 8px 28px rgba(0,0,0,.34),inset 0 0 18px rgba(70,255,170,.06);backdrop-filter:blur(9px);font:12px/1.2 system-ui,sans-serif;pointer-events:none}
		.Awtsmoos-realtime-signal{width:10px;height:10px;flex:0 0 auto;border-radius:50%;background:#ffd166;box-shadow:0 0 0 4px rgba(255,209,102,.12),0 0 14px rgba(255,209,102,.58)}
		.Awtsmoos-realtime-copy{display:grid;gap:1px}.Awtsmoos-realtime-copy small{color:#9fd8c1;font-size:9px;font-weight:800;letter-spacing:.13em}.Awtsmoos-realtime-copy strong{color:#fff3b6;font-size:13px}.Awtsmoos-realtime-copy>span{color:#c9ded5;font-size:10px}
		.Awtsmoos-realtime-status[data-healthy="true"] .Awtsmoos-realtime-signal{background:#5dffa5;box-shadow:0 0 0 4px rgba(93,255,165,.12),0 0 14px rgba(93,255,165,.72)}
		.Awtsmoos-realtime-status[data-state="error"] .Awtsmoos-realtime-signal,.Awtsmoos-realtime-status[data-state="failed"] .Awtsmoos-realtime-signal{background:#ff6b6b;box-shadow:0 0 0 4px rgba(255,107,107,.12),0 0 14px rgba(255,107,107,.62)}
		@media(max-width:620px){.Awtsmoos-realtime-status{right:8px;top:8px;min-width:0;padding:7px 9px}.Awtsmoos-realtime-copy small{display:none}}
	`;
	(documentValue.head || documentValue.documentElement).append(style);
}
