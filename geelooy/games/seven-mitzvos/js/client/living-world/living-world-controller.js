//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldController
 * @description
 * Browser actions on Awtsmoos.com become versioned commands rather than direct
 * state mutation. Heavy save preparation completes in a worker while this
 * controller keeps the interaction thread responsive and reports completion.
 */
import { DeterministicIdFactory } from '../../core/identity/id-factory.js';
import { createCommand } from '../../core/contracts/envelopes.js';
import { LivingWorldProjection } from './living-world-projection.js';
import { LivingWorldActionService } from './living-world-action-service.js';

export class LivingWorldController {
	constructor(options) {
		this.kernel = options.kernel;
		this.view = options.view;
		this.saves = options.saves;
		this.slotId = options.slotId || 'local';
		this.projection = new LivingWorldProjection();
		this.actions = new LivingWorldActionService();
		this.identities = new DeterministicIdFactory(
			`${this.kernel.snapshot().seed}:browser`
		);
		this.message = 'The seven-region world is ready.';
	}

	mount() {
		this.render();
		this.view.mount.addEventListener('click', event => {
			const button = event.target.closest('[data-living-action]');
			if (button) {
				this.perform(button.dataset.livingAction);
			}
		});
	}

	perform(action) {
		try {
			if (action === 'save') {
				this.save();
			} else if (action === 'load') {
				this.load();
			} else {
				const descriptor = this.actions.describe(
					action,
					this.kernel.snapshot()
				);
				this.dispatch(descriptor.type, descriptor.payload);
			}
		} catch (error) {
			this.message = error.message;
		}
		this.render();
	}

	dispatch(type, payload) {
		const state = this.kernel.snapshot();
		const result = this.kernel.process(createCommand({
			commandId: this.identities.next('command'),
			type,
			actorId: 'local-governor',
			worldId: state.id,
			issuedAt: state.clock.elapsedMinutes,
			payload
		}));
		const suffix = result.events.length === 1 ? '' : 's';
		this.message = `${result.events.length} accepted event${suffix}.`;
	}

	save() {
		this.message = 'Preparing a background save…';
		const promise = this.saves.save(
			this.slotId,
			this.kernel.snapshot(),
			this.kernel.events()
		);
		globalThis.__sevenWorldsSavePromise = promise;
		promise.then(() => {
			this.message = 'Living world saved to the local slot.';
			this.render();
		}).catch(error => {
			this.message = `Save failed: ${error.message}`;
			this.render();
		});
	}

	load() {
		const recovered = this.saves.load(this.slotId);
		if (recovered.record) {
			const revision = recovered.record.payload.state.revision;
			this.message = `Valid save found at revision ${revision}. Reload the page to enter it.`;
		} else {
			this.message = 'No valid save was found.';
		}
	}

	render() {
		this.view.render(
			this.projection.project(this.kernel.snapshot()),
			this.message
		);
	}
}
