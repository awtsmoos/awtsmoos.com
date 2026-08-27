// B"H
// Boruch Hashem
// Blessed is He

/**
 * Furniture, devices, mugs, papers, spoon, tablet, steam, and coupon receive
 * timed object clips and material construction. The Awtsmoos renews each object;
 * Awtsmoos.com keeps every motion persisted, editable, previewed, and exported.
 */
export class RealisticMinuteObjects {
	static create() {
		return [
			this.object('office_desk', 'desk', 'background', 0, 60000, 132, 254, 0.95, 0.34),
			this.object('office_plant', 'plant', 'background', 0, 60000, 52, 225, 0.82, 0.24),
			this.object('office_clock', 'wallClock', 'background', 0, 60000, 382, 104, 0.86, 0.2, { type: 'static' }, { seconds: 48 }),
			this.object('office_laptop', 'laptop', 'midground', 0, 60000, 210, 219, 0.64, 0.46),
			this.object('office_printer', 'printer', 'background', 0, 48000, 548, 195, 0.7, 0.3),
			this.object('machine_base_a', 'coffeeMachine', 'background', 0, 6500, 440, 176, 0.8, 0.38, { type: 'static' }, { text: '1 CUP' }),
			this.object('machine_insert', 'coffeeMachine', 'foreground', 6500, 3000, 278, 118, 1.38, 0.82, { type: 'flash' }, { text: '1 CUP' }),
			this.object('machine_base_b', 'coffeeMachine', 'background', 9500, 19500, 440, 176, 0.8, 0.38, { type: 'static' }, { text: '1 CUP' }),
			this.object('machine_chaos', 'coffeeMachine', 'foreground', 29000, 6000, 286, 120, 1.36, 0.82, { type: 'steam' }, { text: 'ERROR', flash: true }),
			this.object('machine_base_c', 'coffeeMachine', 'background', 35000, 25000, 440, 176, 0.8, 0.38, { type: 'static' }, { text: 'TEA?' }),
			this.object('rolling_chair', 'chair', 'midground', 3000, 12000, 250, 222, 0.8, 0.55, { type: 'roll', toX: 338, toY: 226 }),
			this.object('meeting_papers', 'papers', 'midground', 15000, 14000, 248, 224, 0.72, 0.52),
			this.object('flying_papers', 'papers', 'foreground', 29000, 10000, 250, 218, 0.72, 0.74, { type: 'flutter', toX: 410, toY: 150 }),
			this.object('calendar_insert', 'tablet', 'foreground', 22000, 3500, 286, 132, 1.18, 0.84, { type: 'flash' }, { text: 'MUG INVITED' }),
			this.object('mug_waiting', 'mug', 'midground', 9500, 19500, 475, 222, 0.66, 0.55, { type: 'static' }, { steam: true }),
			this.object('mug_slide', 'mug', 'foreground', 35000, 3800, 248, 242, 0.72, 0.78, { type: 'slide', toX: 480, toY: 244 }),
			this.object('mug_bounce', 'mug', 'foreground', 38800, 4200, 480, 244, 0.72, 0.82, { type: 'bounce', toX: 362, toY: 168, height: 48 }),
			this.object('spoon_waiting', 'spoon', 'midground', 18500, 16500, 316, 232, 0.82, 0.56),
			this.object('spoon_spin', 'spoon', 'foreground', 35000, 6500, 316, 230, 0.9, 0.86, { type: 'spin', toX: 430, toY: 164, turns: 8 }),
			this.object('printer_active', 'printer', 'foreground', 48000, 5500, 278, 120, 1.28, 0.82, { type: 'print', travel: 16 }, { flash: true }),
			this.object('coupon_output', 'coupon', 'foreground', 51500, 6500, 382, 208, 0.82, 0.8, { type: 'slide', toX: 342, toY: 174 }, { text: 'FREE TEA' }),
			this.object('phone_alert', 'phone', 'midground', 15000, 8000, 190, 216, 0.72, 0.54, { type: 'flash' })
		];
	}

	static assetUses(objects) {
		return objects.map(object => ({ id: `object_clip_${object.id}`, trackId: 'track_props', start: object.start, duration: object.duration, type: 'scene-object', name: object.id, payload: { ...object } }));
	}

	static object(id, kind, layer, start, duration, x, y, scale, depth, motion = { type: 'static' }, state = {}) {
		return { id, kind, layer, start, duration, x, y, scale, depth, motion, state };
	}
}
