// B"H
/** One interpolated remote participant, always rendered from chossid.glb with independent bones. */
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { PLAYER_SPAWN } from '../app/EretzPlayerStateFactory.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

export class RemoteChossidActor {
	constructor(gltf, remote, ground, presentationOffset) {
		this.id = remote.id;
		this.ground = ground;
		this.offset = presentationOffset;
		this.model = gltf.scene;
		this.model.name = `Awtsmoos_remote_chossid_${remote.id}`;
		this.model.scale.set(1.46, 1.46, 1.46);
		this.model.position.set(0, 0, 0);
		this.footOffset = alignModelFeetToGround(this.model, 0).offset ?? 0;
		this.model.setBaseTransform();
		this.player = new TinyAnimationPlayer(this.model, gltf.animations);
		this.clips = animationClips(this.player.names);
		this.activeClip = this.clips.idle;
		this.player.play(this.activeClip);
		this.position = { x: 0, y: 0, z: 0 };
		this.target = { x: 0, y: 0, z: 0 };
		this.facing = remote.facing || 0;
		this.moving = false;
		this.animationClock = 0;
		this.applySnapshot(remote, true);
	}

	applySnapshot(remote, snap = false) {
		const server = remote.position || {};
		this.target.x = PLAYER_SPAWN.x + Number(server.x || 0) + this.offset.x;
		this.target.z = PLAYER_SPAWN.z + Number(server.z || 0) + this.offset.z;
		this.target.y = this.ground.heightAt(this.target.x, this.target.z) + this.footOffset;
		this.facing = Number(remote.facing || 0);
		this.moving = Math.hypot(Number(remote.velocity?.x || 0), Number(remote.velocity?.z || 0)) > 0.001;
		if (snap) Object.assign(this.position, this.target);
	}

	update(deltaTime) {
		const blend = 1 - Math.exp(-deltaTime * 12);
		this.position.x += (this.target.x - this.position.x) * blend;
		this.position.y += (this.target.y - this.position.y) * blend;
		this.position.z += (this.target.z - this.position.z) * blend;
		const wanted = this.moving ? this.clips.walk : this.clips.idle;
		if (wanted !== this.activeClip) {
			this.activeClip = wanted;
			this.player.play(wanted);
		}
		this.animationClock += deltaTime;
		if (this.animationClock >= 1 / 30) {
			this.player.update(this.animationClock);
			this.animationClock = 0;
		}
		this.model.position.set(this.position.x, this.position.y, this.position.z);
		this.model.quaternion.set(0, Math.sin(this.facing / 2), 0, Math.cos(this.facing / 2));
	}
}

function animationClips(names) {
	const pick = (expression, fallback) => names.find(name => expression.test(name)) || fallback;
	const idle = pick(/stand|idle|neutral/i, names[0] || '');
	return { idle, walk: pick(/walk|step|stroll/i, idle) };
}
