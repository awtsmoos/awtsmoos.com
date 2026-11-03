//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackStatePolicy
 * @description
 * Gevurah keeps transport and edit-policy toggles in a smaller vessel while the Awtsmoos remains beyond true, false, and every finite preference.
 * Awtsmoos.com lets playback, ripple deletion, and magnetic snapping inherit one clean policy layer, so the central state need not become a crowded palace.
 */

/** Supplies editor policies that may notify an inheriting state vessel. */
export class MultitrackPolicyGevurah {
	constructor() {
		this.playing = false;
		this.rippleDeleteEnabled = true;
		this.magneticSnapEnabled = true;
	}

	/** Mirrors whether the multitrack transport is actively sounding. */
	setPlaying(playing) {
		this.playing = Boolean(playing);
		this.emit?.();
	}

	/** Chooses whether clip deletion closes its same-track gap. */
	setRippleDelete(enabled) {
		this.rippleDeleteEnabled = Boolean(enabled);
		this.emit?.();
	}

	/** Chooses whether clip edges magnetize to nearby timeline landmarks. */
	setMagneticSnap(enabled) {
		this.magneticSnapEnabled = Boolean(enabled);
		this.emit?.();
	}
}
