//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldKernel
 * @description
 * The living world on Awtsmoos.com receives validated intent, emits authoritative facts, persists revisions, and remains independent of every browser surface. The Awtsmoos is the source; this kernel is a transparent finite vessel.
 */
import { DeterministicIdFactory } from '../core/identity/id-factory.js';
import { ContractGuard } from '../core/validation/contract-guard.js';
import { createEvent } from '../core/contracts/envelopes.js';
import { EventJournal } from '../core/events/event-journal.js';
import { LivingWorldCommandRouter } from './living-world-command-router.js';
import { reduceLivingWorld } from './living-world-reducer.js';

export class LivingWorldKernel {
	/**
	 * @param {object} initialState Valid world snapshot.
	 * @param {{repository?: object, journal?: object[]}} options Runtime adapters.
	 */
	constructor(initialState, options = {}) {
		this.state = clone(initialState);
		this.repository = options.repository || null;
		this.guard = new ContractGuard();
		this.identities = new DeterministicIdFactory(this.state.seed);
		primeIdentities(this.identities, this.state);
		this.router = new LivingWorldCommandRouter(this.state.seed, this.identities);
		const journal = options.journal || [];
		const baseRevision = Math.max(0, this.state.revision - journal.length);
		this.journal = new EventJournal(journal, baseRevision);
	}

	/**
	 * @param {object} command Validated command envelope.
	 * @returns {{events: object[], state: object, duplicate: boolean}} Processing result.
	 */
	process(command) {
		this.guard.command(command);
		if (this.state.processedCommandIds.includes(command.commandId)) {
			return { events: [], state: this.snapshot(), duplicate: true };
		}
		const facts = this.router.route(this.state, command);
		const events = facts.map(fact => this.acceptFact(fact, command));
		this.persist();
		return { events, state: this.snapshot(), duplicate: false };
	}

	/** @returns {object} Safe world snapshot. */
	snapshot() {
		return clone(this.state);
	}

	/** @returns {object[]} Safe journal tail. */
	events() {
		return this.journal.snapshot();
	}

	acceptFact(fact, command) {
		const event = createEvent({
			eventId: this.identities.next('event'),
			commandId: command.commandId,
			type: fact.type,
			worldId: this.state.id,
			actorId: command.actorId,
			revision: this.state.revision + 1,
			simulationTime: this.state.clock.elapsedMinutes,
			visibility: fact.visibility || 'public',
			payload: fact.payload
		});
		this.journal.append(event);
		this.state = reduceLivingWorld(this.state, event);
		return event;
	}

	persist() {
		if (this.repository) {
			this.repository.save(this.state.id, { state: this.state, events: this.events() });
		}
	}
}

function primeIdentities(identities, state) {
	for (let index = 0; index < state.revision; index += 1) {
		identities.next('event');
	}
	for (const unused of state.cases) {
		identities.next('case');
	}
	for (const unused of state.treaties) {
		identities.next('treaty');
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
