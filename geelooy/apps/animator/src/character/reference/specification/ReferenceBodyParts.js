// B"H
// Boruch Hashem
// Blessed is He

/**
 * The body is not a silhouette pasted onto a stage. The Awtsmoos renews every
 * joint as a named vessel, and Awtsmoos.com keeps each vessel selectable,
 * poseable, keyframeable, serializable, and visible to the production renderer.
 */
export class ReferenceBodyParts {
	static definitions() {
		return [
			this.part('root', null, 'transform'),
			this.part('pelvis', 'root', 'bone'),
			this.part('torso', 'pelvis', 'shape'),
			this.part('chest', 'torso', 'bone'),
			this.part('neck', 'chest', 'bone'),
			this.part('head', 'neck', 'bone'),
			this.part('wardrobe', 'torso', 'group'),
			this.part('outerwear', 'wardrobe', 'shape'),
			this.part('shirt', 'wardrobe', 'shape'),
			this.part('skirt', 'wardrobe', 'shape'),
			...this.arm('left'),
			...this.arm('right'),
			...this.leg('left'),
			...this.leg('right')
		];
	}

	static arm(side) {
		return [
			this.part(`${side}Arm`, 'chest', 'group'),
			this.part(`${side}Shoulder`, `${side}Arm`, 'bone'),
			this.part(`${side}UpperArm`, `${side}Shoulder`, 'shape'),
			this.part(`${side}Elbow`, `${side}UpperArm`, 'bone'),
			this.part(`${side}Forearm`, `${side}Elbow`, 'shape'),
			this.part(`${side}Wrist`, `${side}Forearm`, 'bone'),
			this.part(`${side}Hand`, `${side}Wrist`, 'control')
		];
	}

	static leg(side) {
		return [
			this.part(`${side}Leg`, 'pelvis', 'group'),
			this.part(`${side}Hip`, `${side}Leg`, 'bone'),
			this.part(`${side}Thigh`, `${side}Hip`, 'shape'),
			this.part(`${side}Knee`, `${side}Thigh`, 'bone'),
			this.part(`${side}Shin`, `${side}Knee`, 'shape'),
			this.part(`${side}Ankle`, `${side}Shin`, 'bone'),
			this.part(`${side}Foot`, `${side}Ankle`, 'control')
		];
	}

	static part(id, parent, type) {
		return { id, parent, type, editable: true, keyframeable: true };
	}
}
