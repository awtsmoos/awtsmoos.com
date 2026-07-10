// B"H
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

/** One panel matrix governs sight, touch, and collision without stale yaw state. */
export class DynamicDoor3D {
	constructor(definition = tallDoorDef()) {
		this.def = definition;
		this.t = 0;
		this.state = 'closed';
		this.hovered = false;
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

	toggle() {
		this.state = this.state === 'closed' ? 'opening' : 'closing';
	}

	update(deltaTime) {
		const direction = this.state === 'opening' ? 1 : this.state === 'closing' ? -1 : 0;
		this.t = Math.max(0, Math.min(1, this.t + direction * deltaTime * 2.15));
		if (this.t >= 1) {
			this.t = 1;
			this.state = 'open';
		} else if (this.t <= 0) {
			this.t = 0;
			this.state = 'closed';
		}
		this.setPose();
	}

	activeColliders() {
		return this.currentColliders;
	}

	setHover(enabled) {
		this.hovered = !!enabled;
		this.panel.material.color = enabled ? [1, 0.78, 0.26, 1] : colorArray(this.def.color);
	}

	setPose() {
		this.pose = doorPose(this.def, this.t);
		this.mesh.matrix = new Float32Array(this.pose.matrix);
		this.mesh.position.set(0, 0, 0);
		this.mesh.quaternion.set(0, 0, 0, 1);
		this.currentColliders = primitiveColliders(colliderDefinition(this.def, this.t));
		this.refreshWorldMatrix();
	}

	refreshWorldMatrix() {
		const parentMatrix = this.mesh.parent?.matrixWorld;
		this.mesh.updateWorldMatrix(parentMatrix);
		return this.mesh.matrixWorld;
	}

	obb() {
		return orientedBox(this.def, this.t);
	}

	debug() {
		return createDoorDebugEvidence(this);
	}
}

export const highDoorDef = tallDoorDef;

function panelDefinition(definition) {
	return {
		id: `${definition.id}-panel`,
		shape: 'box',
		color: definition.color || '#6b3d1e',
		mapImage: definition.mapImage || null,
		textureUrl: definition.textureUrl || null,
		mapRepeat: definition.mapRepeat || [1, 1],
		position: { x: 0, y: 0, z: 0 },
		size: { x: definition.width, y: definition.height, z: definition.thickness },
		rotation: { y: 0 }
	};
}
