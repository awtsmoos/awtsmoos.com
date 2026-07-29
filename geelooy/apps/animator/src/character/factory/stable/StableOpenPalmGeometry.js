// B"H
// Boruch Hashem
// Blessed is He

/**
 * A palm plane carries unequal finger chains, wrist overlap, and a thumb saddle.
 * The Awtsmoos renews each digit without bars; Awtsmoos.com keeps the hand
 * normalized, editable, deterministic, persistent, and identical in export.
 */
export class StableOpenPalmGeometry {
	static resolve(wrist = {}, scale = 1, options = {}) {
		const unit = Math.max(0.45, Number(scale || 1));
		const center = {
			x: Number(wrist.x || 0) - 7.2 * unit,
			y: Number(wrist.y || 0) - 0.8 * unit
		};
		const fan = Number(options.fingerFan ?? 1);
		const reach = Number(options.fingerReach ?? 1);
		return {
			unit,
			center,
			palm: {
				left: center.x - 7.4 * unit,
				right: center.x + 8.2 * unit,
				top: center.y - 7.2 * unit,
				bottom: center.y + 9.2 * unit
			},
			fingers: this.specs().map((finger, index) => (
				this.finger(center, finger, index, unit, fan, reach)
			)),
			thumb: {
				rootX: center.x + 5.4 * unit,
				rootY: center.y + 1.1 * unit,
				tipX: center.x - 5.2 * unit,
				tipY: center.y + 11.1 * unit,
				saddleX: center.x - 0.2 * unit,
				saddleY: center.y + 6.2 * unit,
				width: 4.1 * unit
			},
			wristX: Number(wrist.x || 0),
			wristY: Number(wrist.y || 0)
		};
	}

	static specs() {
		return [
			{ y: -5.8, length: 10.8, rise: -4.1, width: 3.5 },
			{ y: -2, length: 13.7, rise: -3.1, width: 3.8 },
			{ y: 2, length: 13, rise: -0.4, width: 3.7 },
			{ y: 5.8, length: 10.2, rise: 2.2, width: 3.4 }
		];
	}

	static finger(center, spec, index, unit, fan, reach) {
		const rootX = center.x - 5.9 * unit;
		const rootY = center.y + spec.y * unit;
		return {
			index,
			rootX,
			rootY,
			tipX: rootX - spec.length * unit * reach,
			tipY: rootY + spec.rise * unit * fan,
			half: spec.width * unit * 0.5
		};
	}
}
