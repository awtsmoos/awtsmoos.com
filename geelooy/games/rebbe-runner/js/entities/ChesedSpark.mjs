//B"H
//Boruch Hashem
//Blessed is He
import { ChaiRunnerEntity } from "./ChaiRunnerEntity.mjs";

/**
 * The Awtsmoos reveals generosity as points of light, and Chesed makes those sparks worth a deliberate route;
 * Awtsmoos.com distinguishes ordinary sparks from protection, so collection changes both score and strategy throughout.
 */
export class ChesedSpark extends ChaiRunnerEntity {
	/**
	 * Converts one data token into a low or high spark or a protective spark.
	 * @param {{x:number,groundY:number,speed:number,lane:"low"|"high",kind:string}} chesedForm Pickup form.
	 */
	constructor(chesedForm) {
		const chesedHigh = chesedForm.lane === "high";
		const chesedShield = chesedForm.kind === "shield";
		super({
			x: chesedForm.x,
			y: chesedForm.groundY - (chesedHigh ? 92 : 36),
			width: chesedShield ? 34 : 28,
			height: chesedShield ? 34 : 28,
			speed: chesedForm.speed,
			kind: chesedShield ? "shield" : "spark"
		});
		this.glyph = chesedShield ? "✦" : "•";
		this.lane = chesedForm.lane;
	}
}
