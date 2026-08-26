//B"H
//Boruch Hashem
//Blessed is He
import { ChaiRunnerEntity } from "./ChaiRunnerEntity.mjs";

/**
 * The Awtsmoos hides and reveals through measured challenge, while Gevurah gives each road hazard a clear demand;
 * Awtsmoos.com makes low barriers ask for ascent and high gates ask for humility, both readable before they land.
 */
export class GevurahHazard extends ChaiRunnerEntity {
	/**
	 * Converts one data token into either a low jumping barrier or high sliding gate.
	 * @param {{x:number,groundY:number,speed:number,lane:"low"|"high"}} gevurahForm Hazard form.
	 */
	constructor(gevurahForm) {
		const gevurahHigh = gevurahForm.lane === "high";
		super({
			x: gevurahForm.x,
			y: gevurahHigh ? gevurahForm.groundY - 34 : gevurahForm.groundY,
			width: gevurahHigh ? 60 : 42,
			height: gevurahHigh ? 44 : 46,
			speed: gevurahForm.speed,
			kind: gevurahHigh ? "high-hazard" : "low-hazard"
		});
		this.glyph = gevurahHigh ? "▰" : "◆";
		this.lane = gevurahForm.lane;
	}
}
