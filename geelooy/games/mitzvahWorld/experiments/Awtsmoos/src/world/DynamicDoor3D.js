// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DynamicDoor3D.js
 * @description Governs one performant door panel through interaction, motion, collision, events, and cleanup.
 * The Awtsmoos renews passage between rooms without stale geometry; Awtsmoos.com lets one measured
 * progress value govern sight, touch, collision, feedback, and optional return to a quiet closed state.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import { colorArray } from './DoorCollisionGeometry.js';
import { createDoorDebugEvidence } from './DoorDebugEvidence.js';
import { DoorInteractionController } from './DoorInteractionController.js';
import {
	colliderDefinition,
	doorPose,
	orientedBox
} from './DoorRuntimePose.js';
import { tallDoorDef } from './DoorwaySpecs.js';

const DEFAULT_SPEED = 2.15;

export class DynamicDoor3D {
	constructor(definition = tallDoorDef()) {
		this.def = definition;
		this.t = 0;
		this.state = 'closed';
		this.hovered = false;
		this.autoCloseRemaining = 0;
		this.mesh = new Group();
		this.mesh.name = `${definition.id}-panel-frame`;
		this.panel = createPrimitiveMesh(panelDefinition(definition));
		this.panel.name = `${definition.id}-dynamic-door`;
		this.mesh.add(this.panel);
		this.interaction = new DoorInteractionController(this);
		this.setPose();
		this.closedColliders = [...this.currentColliders];
	}

	setInteractionContext(context = {}) {
		this.interaction.setContext(context);
		return this;
	}

	install(canvas, camera) {
		this.interaction.install(canvas, camera);
		return this;
	}

	clickable() {
		return this.state === 'closed' || this.state === 'open';
	}

	toggle(source = 'unknown') {
		if (this.state === 'closed') {
			return this.open(source);
		}
		if (this.state === 'open') {
			return this.close(source);
		}
		return false;
	}

	open(source = 'unknown') {
		if (this.state === 'open' || this.state === 'opening') {
			return false;
		}
		this.setState('opening', source);
		return true;
	}

	close(source = 'unknown') {
		if (this.state === 'closed' || this.state === 'closing') {
			return false;
		}
		this.setState('closing', source);
		return true;
	}

	update(deltaTime) {
		if (this.state === 'open' && this.autoCloseRemaining > 0) {
			this.autoCloseRemaining = Math.max(0, this.autoCloseRemaining - deltaTime);
			if (this.autoCloseRemaining === 0) {
				this.close('auto-close');
			}
		}
		const direction = motionDirection(this.state);
		if (direction === 0) {
			return;
		}
		const previousProgress = this.t;
		const speed = finitePositive(this.def.openSpeed, DEFAULT_SPEED);
		this.t = clamp01(previousProgress + direction * deltaTime * speed);
		if (this.t >= 1) {
			this.t = 1;
			this.setState('open', 'motion-complete');
			this.autoCloseRemaining = finitePositive(this.def.autoCloseSeconds, 0);
		} else if (this.t <= 0) {
			this.t = 0;
			this.setState('closed', 'motion-complete');
		}
		if (this.t !== previousProgress) {
			this.setPose();
		}
	}

	activeColliders() {
		return this.currentColliders;
	}

	setHover(enabled) {
		const next = Boolean(enabled);
		if (next === this.hovered) {
			return;
		}
		this.hovered = next;
		this.panel.material.color = next
			? [1, 0.78, 0.26, 1]
			: colorArray(this.def.color);
	}

	setState(nextState, source) {
		if (nextState === this.state) {
			return;
		}
		const previousState = this.state;
		this.state = nextState;
		this.interaction.context.bus?.emit?.('door:state', {
			doorId: this.def.id,
			previousState,
			source,
			state: nextState
		});
	}

	setPose() {
		this.pose = doorPose(this.def, easedProgress(this.t));
		this.mesh.matrix = new Float32Array(this.pose.matrix);
		this.mesh.position.set(0, 0, 0);
		this.mesh.quaternion.set(0, 0, 0, 1);
		this.currentColliders = primitiveColliders(
			colliderDefinition(this.def, easedProgress(this.t))
		);
		this.refreshWorldMatrix();
	}

	refreshWorldMatrix() {
		const parentMatrix = this.mesh.parent?.matrixWorld;
		this.mesh.updateWorldMatrix(parentMatrix);
		return this.mesh.matrixWorld;
	}

	obb() {
		return orientedBox(this.def, easedProgress(this.t));
	}

	debug() {
		return {
			...createDoorDebugEvidence(this),
			autoCloseRemaining: this.autoCloseRemaining,
			hovered: this.hovered
		};
	}

	destroy() {
		this.interaction.uninstall();
		this.mesh.parent?.remove(this.mesh);
	}
}

export const highDoorDef = tallDoorDef;

function motionDirection(state) {
	if (state === 'opening') {
		return 1;
	}
	if (state === 'closing') {
		return -1;
	}
	return 0;
}

function easedProgress(value) {
	const progress = clamp01(value);
	return progress * progress * (3 - 2 * progress);
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function panelDefinition(definition) {
	return {
		color: definition.color || '#6b3d1e',
		id: `${definition.id}-panel`,
		mapImage: definition.mapImage || null,
		mapRepeat: definition.mapRepeat || [1, 1],
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'box',
		size: {
			x: definition.width,
			y: definition.height,
			z: definition.thickness
		},
		textureUrl: definition.textureUrl || null
	};
}
