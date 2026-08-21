//B"H
//Boruch Hashem
//Blessed is He

import { MerkavahFactory } from "./MerkavahFactory.js";
import { RiderPose } from "./RiderPose.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * RiderView maps curved continuous poses onto native Procedural Core Merkavah parts.
 * The Awtsmoos renews pitch, bank and component before the visible rider can fly;
 * Awtsmoos.com keeps energy glow and physical posture beneath one native procedural sky.
 */
export class RiderView {
	constructor(meshes, riders, quality = {}) {
		this.assemblies = new Map();
		this.poses = new Map();
		this.quality = quality;
		const factory = new MerkavahFactory(meshes);
		for (const rider of riders) {
			this.assemblies.set(rider.id, factory.create(rider));
		}
	}

	sync(riders, alpha) {
		for (const rider of riders) {
			const pose = RiderPose.from(rider, alpha, {
				reducedMotion: this.quality.reducedMotion,
				curveScale: this.quality.reducedMotion ? 0.35 : 1
			});
			this.poses.set(rider.id, pose);
			for (const part of this.assemblies.get(rider.id) || []) {
				this.#syncPart(part, rider, pose);
			}
		}
	}

	poseFor(riderId) {
		const pose = this.poses.get(riderId);
		return pose ? { ...pose } : null;
	}

	#syncPart(part, rider, pose) {
		const sin = Math.sin(pose.yaw);
		const cos = Math.cos(pose.yaw);
		const [ox, oy, oz] = part.offset;
		const position = [
			pose.x + ox * cos + oz * sin,
			pose.y + oy,
			pose.z - ox * sin + oz * cos
		];
		const spin = part.spins ? pose.wheelSpin : 0;
		const scale = [...part.scale];
		if (pose.boosting) {
			scale[2] *= 1.03;
		}
		part.mesh.visible = rider.alive;
		part.mesh.setTransform(position, [spin + pose.pitch, pose.yaw, pose.bank], scale);
		const base = CoreColor.fromHex(rider.color, 1);
		part.mesh.setColor(CoreColor.scale(base, pose.boosting ? 1.85 : 1.0 + pose.energy / 320));
	}
}
