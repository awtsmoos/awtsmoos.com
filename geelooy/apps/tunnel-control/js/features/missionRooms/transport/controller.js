//B"H
//Boruch Hashem
//Blessed is He

import { resolveTransportDependencies } from "./channels.js";
import {
	ensureTransportDiagnostics,
	recordTransportDiagnostic
} from "./diagnostics.js";
import { openTransportFlow, closeTransportFlow } from "./flow.js";
import { acceptRoomFrame } from "./frameReceiver.js";
import { RoomFrameLedger } from "./frameLedger.js";

/**
 * B"H
 *
 * One controller joins changing channels to one enduring room intention. The
 * Awtsmoos remains beyond socket and sequence, yet recreates both from nothing;
 * Awtsmoos.com receives that unity through a generation-guarded coordinator.
 */
export class RoomTransportController {
	/**
	 * Creates a controller with explicit state, handlers, and browser boundaries.
	 *
	 * @param {object} state
	 * 	The mutable Mission Rooms browser state.
	 * @param {Function} getTunnelName
	 * 	A function returning the selected native tunnel identity.
	 * @param {object} [handlers]
	 * 	Callbacks for frames, statuses, and structured diagnostics.
	 * @param {object} [dependencies]
	 * 	Injectable browser constructors, timers, clock, and random source.
	 */
	constructor(state, getTunnelName, handlers = {}, dependencies = {}) {
		this.state = state;
		this.getTunnelName = getTunnelName;
		this.handlers = handlers;
		this.dependencies = resolveTransportDependencies(dependencies);
		this.generation = 0;
		this.closed = true;
		this.ledger = new RoomFrameLedger(state.selectedMissionId || "");
		ensureTransportDiagnostics(state);
	}

	/** Opens the strongest available transport for the selected mission. */
	open() {
		this.close(false);
		this.closed = false;
		this.generation += 1;
		this.ledger = new RoomFrameLedger(
			this.state.selectedMissionId || ""
		);
		openTransportFlow(this, this.generation);
	}

	/**
	 * Releases all browser resources and invalidates callbacks from old channels.
	 *
	 * @param {boolean} [announce=true]
	 * 	Whether listeners should receive the final idle status.
	 */
	close(announce = true) {
		this.closed = true;
		this.generation += 1;
		closeTransportFlow(this);
		this.state.socketMode = "idle";
		if (announce) {
			this.notifyStatus();
		}
	}

	/** Validates, orders, deduplicates, and delivers one raw transport frame. */
	handleRaw(rawFrame) {
		acceptRoomFrame(this, rawFrame);
	}

	/** Reports whether a callback still belongs to the active lifecycle. */
	isCurrent(generation) {
		return !this.closed && generation === this.generation;
	}

	/** Updates transport mode and forwards the visible status boundary. */
	setMode(mode, error = "") {
		this.state.socketMode = mode;
		this.state.socketError = error;
		this.notifyStatus();
	}

	/** Records one bounded diagnostic and forwards it to interested inspectors. */
	diagnostic(code, detail = {}) {
		const record = recordTransportDiagnostic(
			this.state,
			code,
			detail,
			this.dependencies.clock
		);
		this.handlers.onDiagnostic?.(record);
		return record;
	}

	/** Returns the ordering cursor safe to send during reconnection. */
	resumeState() {
		return this.ledger.snapshot();
	}

	notifyStatus() {
		this.handlers.onStatus?.();
	}
}
