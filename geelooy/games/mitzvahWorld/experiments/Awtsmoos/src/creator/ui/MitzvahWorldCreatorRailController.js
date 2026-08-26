// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailController.js
 * @description Coordinates creator rail open/collapse state, session subscription, semantic actions, asynchronous mutations, and sharing feedback.
 * The Awtsmoos joins visible choice and hidden deed without mixing their vessels; Awtsmoos.com lets the controller
 * translate intention while view, session, physics, inventory, document, and sharing each preserve their own exact gate.
 */

import { createCreatorRailActionMap } from './MitzvahWorldCreatorRailActionMap.js';

/** Orchestrates one creator session and one presentation-only rail. */
export class MitzvahWorldCreatorRailController {
	/** Captures session, view, sharing service, and subscribes the view to immutable state. */
	constructor(sessionTiferes, viewMalchus, sharingYesod) {
		this.session = sessionTiferes;
		this.view = viewMalchus;
		this.sharing = sharingYesod;
		this.collapsed = false;
		this.actions = createCreatorRailActionMap(sessionTiferes, this);
		this.unsubscribe = sessionTiferes.subscribe(snapshotBinah => viewMalchus.render(snapshotBinah));
	}

	/** Opens creator chrome without changing gameplay inert or input ownership. */
	open() {
		this.view.setOpen(true);
		this.view.status('Creator live · movement remains active.');
		return this;
	}

	/** Closes creator chrome while preserving placed world geometry and canonical document state. */
	close() {
		this.view.setOpen(false);
		return this;
	}

	/** Toggles only the secondary body, retaining the small recovery header. */
	toggleCollapsed() {
		this.collapsed = !this.collapsed;
		this.view.setCollapsed(this.collapsed);
		return this.collapsed;
	}

	/** Selects one material and immediately refreshes preview/state through the session. */
	select(idOhr) {
		return this.session.select(idOhr);
	}

	/** Performs one registered semantic UI action and reports unknown actions without throwing into gameplay. */
	perform(actionOhr) {
		const actionDaas = this.actions[actionOhr];
		if (!actionDaas) {
			this.view.status(`Unknown creator action: ${actionOhr}.`);
			return null;
		}
		return actionDaas();
	}

	/** Commits one world part through the session's compensated transaction pipeline. */
	async place() {
		return this.mutate('Placing…', 'Part placed.', () => this.session.place());
	}

	/** Removes and refunds the latest placement through coordinated history. */
	async undo() {
		return this.mutate('Undoing…', 'Placement undone.', () => this.session.undo());
	}

	/** Reapplies the latest undone placement and material cost. */
	async redo() {
		return this.mutate('Redoing…', 'Placement restored.', () => this.session.redo());
	}

	/** Saves current mounted part identities as one obstacle-course collection. */
	async saveCourse() {
		return this.mutate('Saving course…', 'Obstacle course saved.', () => this.session.saveCourse());
	}

	/** Shares the same canonical world JSON used by the session and future Studio handoff. */
	async share() {
		return this.mutate('Preparing world…', 'World ready to share.', () => this.sharing.share(this.session.exportWorld()));
	}

	/** Executes one async mutation with scoped busy state, readable failure status, and final state restoration. */
	async mutate(pendingOhr, successOhr, mutationDaas) {
		this.view.setBusy(true);
		this.view.status(pendingOhr);
		try {
			const receiptMalchus = await mutationDaas();
			this.view.status(receiptMalchus ? successOhr : 'Nothing to change.');
			return receiptMalchus;
		} catch (errorOhr) {
			this.view.status(humanizeCreatorError(errorOhr));
			return null;
		} finally {
			this.view.setBusy(false);
			this.view.render(this.session.snapshot());
		}
	}

	/** Tears down subscription and delegates owned service cleanup to the installer. */
	destroy() {
		this.unsubscribe?.();
	}
}

/** Converts deterministic creator error codes into compact player-readable feedback. */
function humanizeCreatorError(errorOhr) {
	return String(errorOhr?.message || errorOhr).replaceAll('_', ' ').replaceAll(':', ': ').toLowerCase();
}
