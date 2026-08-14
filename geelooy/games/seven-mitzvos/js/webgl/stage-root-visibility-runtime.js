//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { spatialVisibilityKey } from '../../../../libs/awtsmoos-procedural-core/src/exports/visibility.js';
import { stageRootVisibilityProfile } from './stage-root-visibility-profile.js';
import { StageRootVisibilityRecord } from './stage-root-visibility-record.js';

const VISIBILITY_CADENCE_SECONDS = 0.2;
const MAX_TRANSITIONS_PER_SCAN = 16;

/**
 * @file stage-root-visibility-runtime.js
 * @description
 * The Awtsmoos renews the visible horizon while canonical city reality remains complete beyond the current camera;
 * Awtsmoos.com lets this runtime rescan semantic roots only when spatial cell, yaw sector, quality tier, or pending transition work changes, preserving hysteresis and bounded renderer mutations.
 * It owns stage-level visibility scheduling only and never changes canonical saves, child gameplay state, materials, or interaction definitions.
 */
export class StageRootVisibilityRuntime {
	constructor(camera, canvas) {
		this.camera = camera;
		this.canvas = canvas;
		this.records = [];
		this.cameraPosition = new THREE.Vector3();
		this.cameraDirection = new THREE.Vector3();
		this.timer = VISIBILITY_CADENCE_SECONDS;
		this.lastKey = '';
		this.dirty = false;
		this.pending = false;
		this.totalTransitions = 0;
	}

	track(root, interactive = false) {
		const profile = stageRootVisibilityProfile(root, interactive);
		if (!profile) {
			return;
		}
		this.records.push(new StageRootVisibilityRecord(root, profile));
		this.dirty = true;
	}

	update(delta = 0) {
		this.timer += Math.max(0, Number(delta) || 0);
		if (this.timer < VISIBILITY_CADENCE_SECONDS) {
			return;
		}
		this.timer = 0;
		const key = this.currentKey();
		if (key === this.lastKey && !this.dirty && !this.pending) {
			return;
		}
		this.lastKey = key;
		this.scan();
		this.dirty = false;
		this.publish();
	}

	scan() {
		let transitions = 0;
		this.pending = false;
		for (const record of this.records) {
			if (!record.evaluate(this.cameraPosition)) {
				continue;
			}
			transitions += 1;
			this.totalTransitions += 1;
			if (transitions >= MAX_TRANSITIONS_PER_SCAN) {
				this.pending = true;
				break;
			}
		}
	}

	currentKey() {
		this.camera.getWorldPosition(this.cameraPosition);
		this.camera.getWorldDirection(this.cameraDirection);
		const yaw = Math.atan2(this.cameraDirection.x, this.cameraDirection.z);
		return spatialVisibilityKey(this.cameraPosition, yaw, {
			cellSize: 3,
			yawSectors: 12,
			qualityTier: this.canvas.dataset.renderScale || '1'
		});
	}

	view() {
		const views = this.records.map(record => record.view());
		return {
			tracked: this.records.length,
			visible: views.filter(view => view.visible).length,
			lodHidden: views.filter(view => view.lodHidden).length,
			domainHidden: views.filter(view => !view.visible && !view.lodHidden).length,
			transitions: this.totalTransitions,
			key: this.lastKey
		};
	}

	publish() {
		const view = this.view();
		const data = this.canvas.dataset;
		data.rootVisibilityTracked = String(view.tracked);
		data.rootVisibilityManaged = String(view.tracked);
		data.rootVisibilityVisible = String(view.visible);
		data.rootVisibilityHidden = String(view.lodHidden);
		data.rootVisibilityDomainHidden = String(view.domainHidden);
		data.rootVisibilityTransitions = String(view.transitions);
		data.rootVisibilityKey = view.key;
	}

	destroy() {
		for (const record of this.records) {
			record.restore();
		}
		this.records.length = 0;
		this.pending = false;
		this.dirty = false;
	}
}
