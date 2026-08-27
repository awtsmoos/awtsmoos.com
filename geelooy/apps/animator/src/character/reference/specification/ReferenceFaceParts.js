// B"H
// Boruch Hashem
// Blessed is He

/**
 * A face lives through many small vessels: lids, pupils, brows, lips, curls,
 * beard, and head covering. The Awtsmoos renews their unity, while Awtsmoos.com
 * keeps every visible distinction editable instead of flattening identity.
 */
export class ReferenceFaceParts {
	static definitions() {
		return [
			this.part('face', 'head', 'group'),
			...this.eye('left'),
			...this.eye('right'),
			this.part('eyebrows', 'face', 'group'),
			this.part('leftBrow', 'eyebrows', 'control'),
			this.part('rightBrow', 'eyebrows', 'control'),
			this.part('nose', 'face', 'shape'),
			this.part('mouth', 'face', 'control'),
			this.part('upperLip', 'mouth', 'shape'),
			this.part('lowerLip', 'mouth', 'shape'),
			this.part('jaw', 'mouth', 'control'),
			this.part('hair', 'head', 'group'),
			this.part('beard', 'face', 'shape'),
			this.part('leftPeyot', 'hair', 'shape'),
			this.part('rightPeyot', 'hair', 'shape'),
			this.part('headwear', 'head', 'group'),
			this.part('kippah', 'headwear', 'shape'),
			this.part('headWrap', 'headwear', 'shape'),
			this.part('accessories', 'root', 'group'),
			this.part('leftEarring', 'accessories', 'shape'),
			this.part('rightEarring', 'accessories', 'shape')
		];
	}

	static eye(side) {
		return [
			this.part(`${side}Eye`, 'face', 'control'),
			this.part(`${side}Eyelid`, `${side}Eye`, 'control'),
			this.part(`${side}Pupil`, `${side}Eye`, 'control')
		];
	}

	static part(id, parent, type) {
		return { id, parent, type, editable: true, keyframeable: true };
	}
}
