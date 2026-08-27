//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresentationCollaboration
 * @description The Awtsmoos renews one deck through many editors; Awtsmoos.com coordinates room identity, snapshot policy, and shared state while transport and invitation remain separate vessels.
 */
import {
	createClientId,
	createPublishMessage,
	createRoomId,
	parseCollaborationEvent,
	REQUEST_EVENT,
	SYNC_EVENT
} from './CollaborationProtocol.js';
import { PresenceSlidesTransport } from './PresenceSlidesTransport.js';
import { copyShareLink, placeRoomInUrl } from './ShareLink.js';

export class PresentationCollaboration {
	constructor(store, options = {}) {
		this.store = store;
		this.roomId = options.roomId || '';
		this.onStatus = options.onStatus || (() => {});
		this.onRoomChanged = options.onRoomChanged || (() => {});
		this.clientId = createClientId();
		this.channel = '';
		this.broadcastTimer = null;
		this.suppressBroadcast = false;
		this.transport = new PresenceSlidesTransport(
			event => this.onSocketEvent(event),
			message => this.onStatus(message)
		);
	}

	start() {
		this.store.subscribe(snapshot => this.onStoreChange(snapshot));
		if (this.roomId) {
			void this.connect(this.roomId);
		}
	}

	async share() {
		if (!this.roomId) {
			this.roomId = createRoomId();
			placeRoomInUrl(this.roomId);
			this.onRoomChanged(this.roomId);
			await this.connect(this.roomId);
		}
		return copyShareLink(location.href);
	}

	async connect(roomId) {
		this.roomId = roomId;
		this.channel = `slides:${roomId}`;
		const connected = await this.transport.connect(
			this.channel,
			this.clientId.slice(0, 24)
		);
		if (connected) {
			this.sendRequest();
		}
		return connected;
	}

	onStoreChange(snapshot) {
		if (!this.roomId || this.suppressBroadcast) {
			return;
		}
		const quietReasons = ['initial', 'select-slide', 'select-element', 'remote-sync'];
		if (quietReasons.includes(snapshot.reason)) {
			return;
		}
		clearTimeout(this.broadcastTimer);
		this.broadcastTimer = setTimeout(() => this.sendSnapshot(), 120);
	}

	onSocketEvent(event) {
		const message = parseCollaborationEvent(event, this.channel);
		if (!message || message.clientId === this.clientId) {
			return;
		}
		if (message.kind === 'request') {
			this.sendSnapshot();
			return;
		}
		if (!message.document || message.revision < this.store.document.revision) {
			return;
		}
		this.suppressBroadcast = true;
		this.store.replaceDocument(message.document, 'remote-sync');
		this.suppressBroadcast = false;
	}

	sendRequest() {
		this.transport.publish(createPublishMessage(
			this.channel,
			REQUEST_EVENT,
			this.clientId,
			{ revision: this.store.document.revision }
		));
	}

	sendSnapshot() {
		this.transport.publish(createPublishMessage(
			this.channel,
			SYNC_EVENT,
			this.clientId,
			{
				revision: this.store.document.revision,
				document: this.store.document
			}
		));
	}
}
