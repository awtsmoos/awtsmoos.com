//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorSessionActions.js
 * @description Gives creator state free placement, history, course, save, reopen, remix, and portable export through one semantic world.
 * The Awtsmoos lets action become memory and memory awaken again as form;
 * Awtsmoos.com keeps every edit, save, reopening, and remix on the same world covenant rather than spawning an editor-only storm.
 */

import { hydrateCreatorSession, remixCreatorSession } from './MitzvahWorldCreatorHydration.js';
import { redoCreatorAction, undoCreatorAction } from './MitzvahWorldCreatorHistoryActions.js';
import { MitzvahWorldCreatorObjectActions } from './MitzvahWorldCreatorObjectActions.js';
import { commitCreatorPlacement, commitUniversePlacement } from './MitzvahWorldCreatorTransactions.js';
import { createSkyDirector } from './MitzvahWorldCreatorSkyDirector.js';
import { createUniverseActorDirector } from './MitzvahWorldUniverseActors.js';
import { resolveUniverseShape } from './MitzvahWorldUniverseShapeResolver.js';

export class MitzvahWorldCreatorSessionActions extends MitzvahWorldCreatorObjectActions {
	select(idOhr) {
		this.controlState.select(idOhr);
		return this.publish();
	}

	nudge(axisOhr, directionOhr) {
		this.controlState.nudge(axisOhr, directionOhr);
		return this.publish();
	}

	adjustElevation(directionOhr) {
		this.controlState.adjustElevation(directionOhr);
		return this.publish();
	}

	adjustDistance(directionOhr) {
		this.controlState.adjustDistance(directionOhr);
		return this.publish();
	}

	rotate(directionOhr) {
		this.controlState.rotate(directionOhr);
		return this.publish();
	}

	async place() {
		const catalogBinah = this.controlState.selectedPart();
		if (catalogBinah.category) {
			return this.placeUniverse(catalogBinah);
		}
		const definitionMalchus = this.placement(this.nextId(catalogBinah.id));
		const receiptYesod = await commitCreatorPlacement(this, catalogBinah, definitionMalchus);
		this.selectedObjectId = definitionMalchus.id;
		this.publish();
		return receiptYesod;
	}

	/** Places one composed universe part (house, tree, character…) as a single atomic deed. */
	async placeUniverse(catalogBinah) {
		const groupId = this.nextId(catalogBinah.id);
		const baseMalchus = { ...this.placement(groupId), shape: 'box' };
		const definitionsOros = resolveUniverseShape(catalogBinah.id, baseMalchus);
		const receiptYesod = await commitUniversePlacement(this, catalogBinah, definitionsOros);
		this.selectedObjectId = definitionsOros[0].id;
		this.trackUniverseActors(catalogBinah, definitionsOros);
		this.publish();
		return receiptYesod;
	}

	/** Places one universe part at explicit world coordinates (template seeding). */
	async placeUniverseAt(partId, x, z) {
		const catalogBinah = this.catalogPart(partId);
		if (!catalogBinah.category) {
			throw new Error(`UNIVERSE_PART_EXPECTED:${partId}`);
		}
		const groundY = Number(this.runtime?.terrain?.heightAt?.(x, z)) || 0;
		const baseMalchus = Object.freeze({
			color: catalogBinah.color,
			id: this.nextId(catalogBinah.id),
			position: Object.freeze({ x, y: groundY + catalogBinah.size.y / 2, z }),
			rotation: Object.freeze({ y: 0 }),
			shape: 'box',
			size: Object.freeze({ ...catalogBinah.size }),
			solid: true,
			userData: Object.freeze({ AwtsmoosCreatorPart: catalogBinah.id }),
			walkable: catalogBinah.walkable
		});
		const definitionsOros = resolveUniverseShape(catalogBinah.id, baseMalchus);
		const receiptYesod = await commitUniversePlacement(this, catalogBinah, definitionsOros);
		this.trackUniverseActors(catalogBinah, definitionsOros);
		this.publish();
		return receiptYesod;
	}

	/** Breathes idle life into placed characters; safe no-op for other categories. */
	trackUniverseActors(catalogBinah, definitionsOros) {
		if (catalogBinah.category !== 'characters') return;
		try {
			this.universeActors ||= createUniverseActorDirector({ environment: this.environment });
			const kind = catalogBinah.shape === 'npc' ? 'npc' : 'animal';
			for (const definitionMalchus of definitionsOros) {
				const mesh = this.runtimeAdapter?.meshFor?.(definitionMalchus.id);
				if (mesh) this.universeActors.track(definitionMalchus.id, mesh, kind);
			}
			this.universeActors.start();
		} catch { /* actor life is decorative; placement already committed */ }
	}

	/** Directs the universe sky and records the choice for save/remix. */
	applyUniverseSky(skyId) {
		if (!this.universeSkyDirector) {
			this.universeSkyDirector = createSkyDirector({
				renderer: this.runtime?.renderer,
				record: entry => {
					try {
						this.universeSkyRecord = Object.freeze({ ...entry });
					} catch { /* record is best-effort */ }
				}
			});
		}
		const receipt = this.universeSkyDirector.setSky(skyId);
		this.publish();
		return receipt.presetId;
	}

	async undo() {
		const receiptYesod = await undoCreatorAction(this);
		this.publish();
		return receiptYesod;
	}

	async redo() {
		const receiptYesod = await redoCreatorAction(this);
		this.publish();
		return receiptYesod;
	}

	async saveCourse(idOhr = this.nextId('course')) {
		return this.documentStore.createCourse(idOhr, this.runtimeAdapter.diagnostics().ids);
	}

	saveWorld() {
		const jsonOhr = this.exportWorld();
		const persistence = this.persistence.save(jsonOhr);
		return Object.freeze({
			bytes: new TextEncoder().encode(jsonOhr).byteLength,
			persistence,
			worldId: this.snapshot().worldId
		});
	}

	async reopenWorld(sourceOhr = null) {
		const storedOhr = sourceOhr ?? this.persistence.load();
		if (!storedOhr) throw new Error('CREATOR_WORLD_SAVED_COPY_MISSING');
		return hydrateCreatorSession(this, storedOhr, { environment: this.environment });
	}

	async remixWorld(sourceOhr = null) {
		const snapshotMalchus = await remixCreatorSession(this, sourceOhr, {
			environment: this.environment
		});
		this.persistence.save(this.exportWorld());
		return snapshotMalchus;
	}

	exportWorld() {
		return this.documentStore.serialize();
	}
}
