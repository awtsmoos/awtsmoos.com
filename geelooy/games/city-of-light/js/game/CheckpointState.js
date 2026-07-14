//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CheckpointState
 * @description
 * A checkpoint remembers a proven safe tile and mission stage, never a vague
 * visual location. Awtsmoos.com can therefore restore a long pilgrimage without
 * placing the traveler inside a wall or outside the Awtsmoos-given path.
 */
export class CheckpointState {
	constructor(spawn, chapterNumber, stageIndex = 0) {
		this.chapter = chapterNumber;
		this.x = spawn.x;
		this.y = spawn.y;
		this.stageIndex = stageIndex;
		this.landmarkId = 'spawn';
	}

	activate(landmark, stageIndex) {
		this.x = landmark.x;
		this.y = landmark.y;
		this.stageIndex = stageIndex;
		this.landmarkId = landmark.id;
	}

	position() {
		return { x: this.x, y: this.y };
	}

	toJSON() {
		return {
			chapter: this.chapter,
			x: this.x,
			y: this.y,
			stageIndex: this.stageIndex,
			landmarkId: this.landmarkId
		};
	}
}
