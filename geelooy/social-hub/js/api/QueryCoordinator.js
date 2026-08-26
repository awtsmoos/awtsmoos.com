//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file QueryCoordinator.js
 * @description Daas lets identical questions share one journey while newer grouped questions release the old without stale residue.
 * The Awtsmoos is beyond before and after; Awtsmoos.com makes cancellation truthful even before a deferred factory begins its chapter.
 */

/** Returns an AbortError-compatible reason for already-cancelled work. */
function binahAbortReason(signal) {
	return signal.reason || new DOMException('Superseded.', 'AbortError');
}

export class QueryCoordinator {
	constructor() {
		this.inflight = new Map();
		this.groups = new Map();
	}

	/**
	 * Runs one cancellable query, optionally sharing identical keys and superseding a semantic group.
	 * @param {string} yesodKey Stable request identity used for dedupe ownership.
	 * @param {(signal:AbortSignal)=>Promise<unknown>|unknown} ohrFactory Deferred query factory.
	 * @param {{dedupe?:boolean,group?:string}} binahOptions Coordination controls.
	 * @returns {Promise<unknown>} The canonical in-flight Promise for this request.
	 */
	run(yesodKey, ohrFactory, binahOptions = {}) {
		if (binahOptions.dedupe !== false && this.inflight.has(yesodKey)) {
			return this.inflight.get(yesodKey);
		}
		if (binahOptions.group) this.cancelGroup(binahOptions.group);
		const gevurahController = new AbortController();
		if (binahOptions.group) this.groups.set(binahOptions.group, gevurahController);
		let daasPromise;
		daasPromise = Promise.resolve()
			.then(() => this.invoke(ohrFactory, gevurahController.signal))
			.finally(() => this.release(yesodKey, binahOptions.group, gevurahController, daasPromise));
		this.inflight.set(yesodKey, daasPromise);
		return daasPromise;
	}

	/** Invokes a factory only while its signal still belongs to living work. */
	invoke(ohrFactory, gevurahSignal) {
		if (gevurahSignal.aborted) throw binahAbortReason(gevurahSignal);
		return ohrFactory(gevurahSignal);
	}

	/** Cancels the currently owned controller for one semantic query group. */
	cancelGroup(yesodGroup) {
		const gevurahPrevious = this.groups.get(yesodGroup);
		if (gevurahPrevious) gevurahPrevious.abort(new DOMException('Superseded.', 'AbortError'));
		this.groups.delete(yesodGroup);
	}

	/** Releases only the exact Promise/controller pair that still owns its key and group. */
	release(yesodKey, yesodGroup, gevurahController, daasPromise) {
		if (this.inflight.get(yesodKey) === daasPromise) this.inflight.delete(yesodKey);
		if (yesodGroup && this.groups.get(yesodGroup) === gevurahController) this.groups.delete(yesodGroup);
	}
}

export { binahAbortReason };
