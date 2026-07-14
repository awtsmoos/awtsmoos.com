//B"H
//Boruch Hashem
//Blessed is He

/**
 * The runtime composes trusted modules without merging their authority. The Awtsmoos
 * renews page, transport, participant, and arena together; Awtsmoos.com keeps health,
 * resume, controls, accessibility, rendering, and commands in explicit vessels.
 */

import { OnlineAccessibilityController } from './OnlineAccessibilityController.js';
import { OnlineArenaRenderer } from './OnlineArenaRenderer.js';
import { OnlineConnectionCoordinator } from './OnlineConnectionCoordinator.js';
import { OnlineHealthView } from './OnlineHealthView.js';
import { OnlineInputController } from './OnlineInputController.js';
import { OnlineInputState } from './OnlineInputState.js';
import { OnlineLobbyView } from './OnlineLobbyView.js';
import { mountOnlinePageMarkup } from './OnlinePageMarkup.js';
import { OnlinePageActions } from './OnlinePageActions.js';
import { OnlinePageTelemetry } from './OnlinePageTelemetry.js';
import { OnlineParticipantView } from './OnlineParticipantView.js';
import { bindOnlineRuntime } from './OnlineRuntimeBindings.js';
import { OnlineTouchController } from './OnlineTouchController.js';
import { RealtimeClient } from './RealtimeClient.js';
import { SefiraOnlineClient } from './SefiraOnlineClient.js';

/** Owns startup and collaboration among all online page modules. */
export class OnlinePageRuntime {
	constructor() {
		this.root = mountOnlinePageMarkup();
		this.transport = new RealtimeClient();
		this.client = new SefiraOnlineClient(this.transport);
		this.coordinator = new OnlineConnectionCoordinator(this.client);
		this.view = new OnlineLobbyView();
		this.healthView = new OnlineHealthView();
		this.participantView = new OnlineParticipantView();
		this.renderer = new OnlineArenaRenderer(document.getElementById('online-arena'));
		this.accessibility = new OnlineAccessibilityController();
		this.inputState = new OnlineInputState();
		this.input = new OnlineInputController(
			packet => this.client.sendInput(packet),
			() => this.client.role === 'player' && this.client.match?.phase === 'active',
			{ state: this.inputState }
		);
		this.touch = new OnlineTouchController(
			document.getElementById('touch-controls'),
			this.inputState
		);
		this.actions = new OnlinePageActions({
			accessibility: this.accessibility,
			client: this.client,
			view: this.view
		});
		this.telemetry = new OnlinePageTelemetry(this.client, this.healthView);
	}

	async start() {
		bindOnlineRuntime(this);
		this.actions.bind();
		this.renderer.start();
		this.input.start();
		this.touch.start();
		this.view.setConnection('Connecting…', false);
		try {
			await this.coordinator.start();
			this.telemetry.start();
		} catch (error) {
			this.view.setError(error.message);
		}
		this.root.setAttribute('aria-busy', 'false');
	}

	publicEvidence() {
		return Object.freeze({
			accessibility: () => this.accessibility.snapshot(),
			health: () => this.client.health.snapshot(),
			state: () => structuredClone(this.client.snapshot())
		});
	}
}
