// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews intention as articulated motion. At Awtsmoos.com the long
 * open palm, guarded crossed arms, and quiet pocketed hand remain keyframeable
 * poses whose breath never destroys the authoritative silhouette.
 */
export class GestureLayer {
	static apply(pose, state, view, time) {
		const gesture = state.gesture
			|| state.raw?.gesture
			|| state.raw?.currentPerformance?.gesture
			|| 'none';
		this.ensureArms(pose);
		const handler = this.handlers()[gesture];
		if (handler) {
			handler.call(this, pose, time, view);
		}
		return pose;
	}

	static handlers() {
		return {
			wave: this.wave,
			point: this.point,
			explain: this.explain,
			open_palm_left: this.openPalmLeft,
			arms_crossed: this.armsCrossed,
			right_hand_in_pocket: this.rightHandInPocket
		};
	}

	static wave(pose, time) {
		Object.assign(pose.arms.right, {
			elbowX: 24,
			elbowY: -18,
			handX: 18 + Math.sin(time * 0.011) * 8,
			handY: -44,
			handPose: 'open'
		});
	}

	static point(pose) {
		Object.assign(pose.arms.right, {
			elbowX: 34,
			elbowY: 10,
			handX: 44,
			handY: -4,
			handPose: 'point'
		});
	}

	static explain(pose, time) {
		Object.assign(pose.arms.right, {
			elbowX: 28,
			elbowY: 20 + Math.sin(time * 0.005) * 5,
			handX: 26 + Math.cos(time * 0.004) * 6,
			handY: 4,
			handPose: 'open'
		});
	}

	static openPalmLeft(pose, time) {
		const breath = Math.sin(time * 0.003) * 1.5;
		Object.assign(pose.arms.left, {
			elbowX: 52 + breath,
			elbowY: 10,
			handX: 48 + breath,
			handY: -11,
			handPose: 'open'
		});
		Object.assign(pose.arms.right, {
			elbowX: -8,
			elbowY: 24,
			handX: -18,
			handY: -4,
			handPose: 'relaxed'
		});
	}

	static armsCrossed(pose, time) {
		const breath = Math.sin(time * 0.0018) * 0.7;
		Object.assign(pose.arms.left, {
			elbowX: -15,
			elbowY: 20 + breath,
			handX: -27,
			handY: -12,
			handPose: 'hold'
		});
		Object.assign(pose.arms.right, {
			elbowX: -15,
			elbowY: 20 - breath,
			handX: -27,
			handY: -12,
			handPose: 'hold'
		});
	}

	static rightHandInPocket(pose, time) {
		const breath = Math.sin(time * 0.002) * 0.8;
		Object.assign(pose.arms.left, {
			elbowX: 8,
			elbowY: 36 + breath,
			handX: 5,
			handY: 23,
			handPose: 'relaxed'
		});
		Object.assign(pose.arms.right, {
			elbowX: -2,
			elbowY: 28,
			handX: -13,
			handY: 16,
			handPose: 'hold'
		});
	}

	static ensureArms(pose) {
		pose.arms ||= {};
		pose.arms.left ||= {};
		pose.arms.right ||= {};
	}

	static sample(args = {}) {
		return this.apply(
			args.pose || {},
			args.state || {},
			args.view || {},
			args.time || 0
		);
	}
}
