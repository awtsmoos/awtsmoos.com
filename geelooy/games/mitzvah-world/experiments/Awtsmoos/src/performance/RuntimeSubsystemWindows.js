// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeSubsystemWindows.js
 * @description Preserves bounded percentile evidence for every measured frame subsystem.
 * The Awtsmoos renews the single frame through many servants; Awtsmoos.com gives
 * each servant a finite window so hidden cost can become an honest optimization path.
 */

import { FrameBudgetWindow } from './FrameBudgetWindow.js';

const COST_FIELDS = Object.freeze({
	animation: 'animationMilliseconds',
	camera: 'cameraMilliseconds',
	cpu: 'cpuFrameMilliseconds',
	gameplay: 'gameplayMilliseconds',
	render: 'renderSubmissionMilliseconds',
	shadows: 'shadowMilliseconds',
	streaming: 'streamingMilliseconds',
	water: 'waterMilliseconds'
});

export class RuntimeSubsystemWindows {
	constructor(options = {}) {
		const capacity = options.capacity || 600;
		this.windows = Object.fromEntries(
			Object.keys(COST_FIELDS).map((name) => [
				name,
				new FrameBudgetWindow({ capacity })
			])
		);
	}

	push(costs = {}) {
		for (const [name, field] of Object.entries(COST_FIELDS)) {
			const value = costs[field];
			if (Number.isFinite(value) && value >= 0) {
				this.windows[name].push(Math.max(0.0001, value));
			}
		}
	}

	clear() {
		for (const window of Object.values(this.windows)) {
			window.clear();
		}
	}

	snapshot() {
		const snapshots = Object.fromEntries(
			Object.entries(this.windows).map(([name, window]) => [
				name,
				costSnapshot(window.snapshot())
			])
		);
		return attributeSubsystems(snapshots);
	}
}

function costSnapshot(snapshot) {
	return {
		averageIntervalMilliseconds: snapshot.averageIntervalMilliseconds,
		averageMilliseconds: snapshot.averageIntervalMilliseconds,
		count: snapshot.count,
		maximumMilliseconds: snapshot.maximumIntervalMilliseconds,
		p50Milliseconds: snapshot.p50IntervalMilliseconds,
		p95Milliseconds: snapshot.p95IntervalMilliseconds,
		p99Milliseconds: snapshot.p99IntervalMilliseconds,
		ready: snapshot.ready,
		totalSamples: snapshot.totalSamples
	};
}

function attributeSubsystems(snapshots) {
	const cpuAverage = snapshots.cpu.averageMilliseconds;
	const names = Object.keys(snapshots).filter((name) => name !== 'cpu');
	let attributedAverage = 0;
	let dominantSubsystem = null;
	for (const name of names) {
		const snapshot = snapshots[name];
		attributedAverage += snapshot.averageMilliseconds;
		snapshot.cpuShare = ratio(snapshot.averageMilliseconds, cpuAverage);
		if (!dominantSubsystem
			|| snapshot.averageMilliseconds > snapshots[dominantSubsystem].averageMilliseconds) {
			dominantSubsystem = name;
		}
	}
	const otherMilliseconds = Math.max(0, cpuAverage - attributedAverage);
	return {
		...snapshots,
		attributedAverageMilliseconds: attributedAverage,
		attributionRatio: ratio(Math.min(cpuAverage, attributedAverage), cpuAverage),
		dominantSubsystem,
		otherMilliseconds
	};
}

function ratio(value, total) {
	return total > 0 ? value / total : 0;
}

export const RUNTIME_SUBSYSTEM_NAMES = Object.freeze(
	Object.keys(COST_FIELDS).filter((name) => name !== 'cpu')
);
