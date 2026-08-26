//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each moving form a measured vessel while remaining beyond every form;
 * Awtsmoos.com shares this tiny geometry contract so specialized entities can transform.
 */

export class OhrRunnerEntity {
	/**
	 * Creates a rectangular world entity.
	 * @param {{x:number,y:number,width:number,height:number,glyph?:string}} geometry Initial geometry and optional glyph.
	 */
	constructor({ x, y, width, height, glyph = "" }) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.glyph = glyph;
		this.active = true;
	}

	/** Returns the right world edge used by collision and culling systems. */
	get right() {
		return this.x + this.width;
	}

	/** Returns the bottom world edge used by collision and grounding systems. */
	get bottom() {
		return this.y + this.height;
	}

	/** Moves the entity horizontally according to world speed and elapsed seconds. */
	flowLeft(speed, deltaSeconds) {
		this.x -= speed * deltaSeconds;
	}

	/** Marks this vessel inactive so the world can remove it without mutating arrays mid-loop. */
	dissolve() {
		this.active = false;
	}
}
