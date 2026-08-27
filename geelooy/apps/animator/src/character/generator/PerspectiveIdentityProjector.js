// B"H
// Boruch Hashem
// Blessed is He

/**
 * One soul appears through many angles without becoming many souls. This
 * projector preserves identity while perspective reshapes the visible vessel.
 */
export class PerspectiveIdentityProjector {
	static views = {
		front: { turn: 0, width: 1, eyeOffset: 1, nose: 0, mirror: false },
		threeQuarterLeft: { turn: -0.5, width: 0.9, eyeOffset: 0.72, nose: -0.14, mirror: false },
		threeQuarterRight: { turn: 0.5, width: 0.9, eyeOffset: 0.72, nose: 0.14, mirror: true },
		sideLeft: { turn: -1, width: 0.66, eyeOffset: 0.25, nose: -0.28, mirror: false },
		sideRight: { turn: 1, width: 0.66, eyeOffset: 0.25, nose: 0.28, mirror: true },
		back: { turn: 2, width: 0.92, eyeOffset: 0, nose: 0, mirror: false }
	};

	static project(identity, viewName = 'front') {
		const view = this.views[viewName] || this.views.front;
		return {
			identityId: identity.identityId,
			view: viewName,
			turn: view.turn,
			mirror: view.mirror,
			head: {
				width: identity.proportions.headWidth * view.width,
				height: identity.proportions.headHeight,
				noseOffset: view.nose,
				eyeSeparation: identity.face.eyeSeparation * view.eyeOffset
			},
			body: {
				shoulderWidth: identity.proportions.shoulderWidth * view.width,
				torsoHeight: identity.proportions.torsoHeight,
				legLength: identity.proportions.legLength
			},
			palette: { ...identity.palette },
			hair: { ...identity.hair },
			wardrobe: identity.wardrobe.map(layer => ({ ...layer })),
			skeleton: this.projectSkeleton(identity.skeleton, view)
		};
	}

	static all(identity) {
		return Object.fromEntries(Object.keys(this.views).map(name => [
			name,
			this.project(identity, name)
		]));
	}

	static projectSkeleton(skeleton, view) {
		return skeleton.map(joint => ({
			...joint,
			x: joint.x * view.width,
			depth: joint.depth * Math.abs(view.turn)
		}));
	}
}
