// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';

/**
 * Running, blocking, carrying, inspecting, recoiling, lunging, catching, and
 * handoff become layered action clips. The Awtsmoos renews every physical choice;
 * Awtsmoos.com keeps preparation, contact, and recovery editable on the timeline.
 */
export class RealisticMinuteActionClips {
	static create() {
		const ids = ReferenceCharacterIds;
		return [
			this.clip('ari_run_in', 'action', ids.cheerful, 2500, 4200, { action: 'run', speed: 1.25, exertion: 0.72 }),
			this.clip('ari_reach_machine', 'gesture', ids.cheerful, 4300, 3600, { gesture: 'reach', intensity: 1 }),
			this.clip('dovid_chair_block', 'gesture', ids.skeptical, 6500, 7200, { gesture: 'block', pose: 'seated', intensity: 1 }),
			this.clip('dovid_rise', 'action', ids.skeptical, 13500, 2600, { action: 'rise', speed: 0.72 }),
			this.clip('rivky_pocket_watch', 'gesture', ids.calm, 2500, 15000, { gesture: 'right_hand_in_pocket', lockedContact: true }),
			this.clip('ari_open_case', 'gesture', ids.cheerful, 15000, 7000, { gesture: 'open_palm_left', lean: 0.11 }),
			this.clip('dovid_crossed_refusal', 'gesture', ids.skeptical, 16000, 12500, { gesture: 'arms_crossed', lockedContact: true }),
			this.clip('dovid_point_booking', 'gesture', ids.skeptical, 18500, 3300, { gesture: 'point_right', intensity: 0.84 }),
			this.clip('rivky_tablet_inspect', 'gesture', ids.calm, 21000, 5200, { gesture: 'inspect', prop: 'forecastTablet', propSide: -1 }),
			this.clip('rivky_present_mugs', 'gesture', ids.calm, 24500, 4200, { gesture: 'present', intensity: 0.8 }),
			this.clip('ari_machine_recoil', 'action', ids.cheerful, 29000, 4300, { action: 'dodge', gesture: 'brace', lean: -0.14, exertion: 0.64 }),
			this.clip('dovid_machine_block', 'gesture', ids.skeptical, 29500, 4700, { gesture: 'block', lean: -0.08 }),
			this.clip('rivky_steam_cover', 'gesture', ids.calm, 29500, 4600, { gesture: 'open_palm_right', lean: -0.06 }),
			this.clip('ari_mug_lunge', 'action', ids.cheerful, 35000, 8000, { action: 'sprint', pose: 'crouched', gesture: 'catch_low', speed: 1.18, exertion: 0.92 }),
			this.clip('dovid_spoon_catch', 'gesture', ids.skeptical, 36500, 6800, { gesture: 'catch_high', prop: 'spoon', propSide: 1, intensity: 1 }),
			this.clip('rivky_mug_catch', 'gesture', ids.calm, 37000, 7200, { gesture: 'catch_low', prop: 'mug', propSide: -1, intensity: 1 }),
			this.clip('ari_balance_freeze', 'gesture', ids.cheerful, 42000, 4200, { gesture: 'hold_mug', prop: 'mug', propSide: 1, pose: 'crouched', lockedContact: true }),
			this.clip('dovid_handoff', 'gesture', ids.skeptical, 45500, 4300, { gesture: 'handoff', prop: 'spoon', propSide: 1 }),
			this.clip('rivky_receive', 'gesture', ids.calm, 45500, 5200, { gesture: 'hold_mug', prop: 'mug', propSide: -1, lockedContact: true }),
			this.clip('ari_final_present', 'gesture', ids.cheerful, 51500, 6200, { gesture: 'present', intensity: 0.72 }),
			this.clip('dovid_final_cross', 'gesture', ids.skeptical, 51000, 8500, { gesture: 'arms_crossed', lockedContact: true }),
			this.clip('rivky_coupon_present', 'gesture', ids.calm, 52500, 6500, { gesture: 'present', intensity: 0.7 })
		];
	}

	static clip(id, type, characterId, start, duration, payload) {
		return { id, type, characterId, start, duration, payload, name: `${characterId} ${payload.action || payload.gesture || type}`, sequenceId: this.sequence(start) };
	}

	static sequence(start) {
		if (start < 15000) return 'cup_arrival';
		if (start < 29000) return 'cup_negotiation';
		if (start < 46500) return 'cup_chaos';
		return 'cup_resolution';
	}
}
