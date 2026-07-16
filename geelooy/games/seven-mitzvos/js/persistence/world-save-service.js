//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldSaveService
 * @description
 * Multiple save slots on Awtsmoos.com carry versioned manifests, integrity
 * hashes, event tails, content declarations, and recent generations. Raw-copy
 * repository adapters keep backup rotation below the visible save-pause budget.
 */
import { checksum } from './checksum.js';
import { WorldRecoveryService } from './world-recovery-service.js';

export class WorldSaveService {
	constructor(repository) {
		this.repository = repository;
		this.recovery = new WorldRecoveryService();
	}

	save(slotId, state, events, contentManifest = []) {
		this.rotate(slotId, 3);
		const payload = { state, events, contentManifest };
		const record = {
			manifest: {
				schemaVersion: 1,
				slotId,
				worldId: state.id,
				revision: state.revision,
				checksum: checksum(payload),
				migrationHistory: []
			},
			payload
		};
		this.repository.save(`slot:${slotId}`, record);
		return record;
	}

	load(slotId) {
		return this.recovery.recover(this.repository, slotId, 3);
	}

	rotate(slotId, generations) {
		for (let index = generations; index >= 1; index -= 1) {
			const source = index === 1
				? `slot:${slotId}`
				: `slot:${slotId}:generation:${index - 1}`;
			const target = `slot:${slotId}:generation:${index}`;
			if (typeof this.repository.copy === 'function') {
				this.repository.copy(source, target);
				continue;
			}
			const record = this.repository.load(source);
			if (record) {
				this.repository.save(target, record);
			}
		}
	}
}
