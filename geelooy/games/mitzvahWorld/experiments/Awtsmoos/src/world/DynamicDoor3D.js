// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import { v } from '../math/Geometry3D.js';
import { colorArray } from './DoorCollisionGeometry.js';
import { DoorInteractionController } from './DoorInteractionController.js';
import {
	closedYaw,
	colliderDefinition,
	currentAngle,
	hingeWorld,
	orientedBox
} from './DoorRuntimePose.js';
import { tallDoorDef } from './DoorwaySpecs.js';

/** Dynamic panel whose closed transform is identical to its owning wall frame. */
export class DynamicDoor3D {
	constructor(definition = tallDoorDef()) {
		this.def = definition;
		this.t = 0;
		this.state = 'closed';
		this.hovered = false;
		this.mesh = new Group();
		this.mesh.name = `${definition.id}-hinge`;
		this.panel = createPrimitiveMesh(panelDefinition(definition));
		this.panel.name = `${definition.id}-dynamic-door`;
		this.mesh.add(this.panel);
		this.closedColliders = primitiveColliders(colliderDefinition(definition, 0));
		this.interaction = new DoorInteractionController(this);
		this.setPose();
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
		if (this.t === 1) {
			this.state = 'open';
		} else if (this.t === 0) {
			this.state = 'closed';
		}
		this.setPose();
	}

	activeColliders() {
		return this.state === 'closed' ? this.closedColliders : [];
	}

	setHover(enabled) {
		this.hovered = !!enabled;
		this.panel.material.color = enabled ? [1, 0.78, 0.26, 1] : colorArray(this.def.color);
	}

	setPose() {
		const hinge = hingeWorld(this.def);
		const yaw = closedYaw(this.def) + currentAngle(this.def, this.t);
		this.mesh.position.set(hinge.x, hinge.y || 0, hinge.z);
		this.mesh.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	}

	obb() {
		return orientedBox(this.def, this.t);
	}

	debug() {
		return {
			id: this.def.id,
			state: this.state,
			closedYaw: closedYaw(this.def),
			wallYaw: this.def.wallYaw,
			colliders: this.closedColliders.length,
			frame: this.def.frame,
			obb: this.obb(),
			interaction: this.interaction.debug()
		};
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
		position: v(definition.width / 2, definition.centerY, 0),
		size: { x: definition.width, y: definition.height, z: definition.thickness },
		rotation: { y: 0 }
	};
}
