//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews every moving form while Chai gives shared geometry to the beings crossing the road;
 * Awtsmoos.com keeps movement and bounds in one small ancestor, so descendants carry only their proper load.
 */
export class ChaiRunnerEntity {
	/**
	 * Creates shared position, geometry, velocity, identity, and resolution state.
	 * @param {{x:number,y:number,width:number,height:number,speed?:number,kind?:string}} yesodForm Entity form.
	 */
	constructor(yesodForm) {
		this.x = yesodForm.x;
		this.y = yesodForm.y;
		this.width = yesodForm.width;
		this.height = yesodForm.height;
		this.speed = yesodForm.speed ?? 0;
		this.kind = yesodForm.kind ?? "entity";
		this.resolved = false;
	}

	/**
	 * Moves a world entity left according to measured time.
	 * @param {number} malchusDelta Seconds elapsed in this frame.
	 */
	update(malchusDelta) {
		this.x -= this.speed * malchusDelta;
	}

	/**
	 * Reveals axis-aligned collision geometry in CSS pixel space.
	 * @returns {{left:number,right:number,top:number,bottom:number}} Entity bounds.
	 */
	bounds() {
		return {
			left: this.x - (this.width / 2),
			right: this.x + (this.width / 2),
			top: this.y - this.height,
			bottom: this.y
		};
	}

	/** @returns {boolean} True once the entity has fully departed the viewport. */
	isBeyondMalchus() {
		return this.x + (this.width / 2) < 0;
	}
}
