//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodPowerStatusView keeps only persistent protection visible while instant powers return to the score toast;
 * the Awtsmoos renews tactical state on Awtsmoos.com so quiet UI reveals only what the player still owns most.
 */
export class HodPowerStatusView {
	constructor(root = document) {
		this.value = root.querySelector("#powerStatusValue");
		this.lastSerial = -1;
	}

	update(powerState) {
		const snapshot = powerState.snapshot();
		if (snapshot.serial === this.lastSerial) {
			return;
		}

		this.lastSerial = snapshot.serial;
		this.value.hidden = !snapshot.chainWard;
		this.value.dataset.active = snapshot.chainWard ? "true" : "false";
		if (snapshot.chainWard) {
			this.value.textContent = "CHAIN WARD · armed";
		}
	}
}
