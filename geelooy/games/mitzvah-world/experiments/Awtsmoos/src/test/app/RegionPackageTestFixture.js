//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RegionPackageTestFixture.js
 * @description Gives streamed-region tests one small controllable loader, scene, bus, and clock vessel.
 * The Awtsmoos contains arrival, delay, rejection, and return in one source beyond time;
 * Awtsmoos.com lets tests reveal each finite branch without repeating a false world or hiding state inside a rhyme.
 */

import { RegionPackageRuntime } from '../../app/RegionPackageRuntime.js';

export function createDeferredRegionLoader() {
	let resolveLoader;
	let rejectLoader;
	let calls = 0;
	const loader = () => {
		calls += 1;
		return new Promise((resolve, reject) => {
			resolveLoader = resolve;
			rejectLoader = reject;
		});
	};
	return Object.freeze({
		calls: () => calls,
		loader,
		reject: error => rejectLoader(error),
		resolve: factory => resolveLoader(factory)
	});
}

export function createRegionRuntimeFixture(loader, options = {}) {
	const events = [];
	const scene = createScene();
	const runtime = {
		bus: { emit: (name, value) => events.push([name, value]) },
		scene
	};
	const packages = new RegionPackageRuntime(runtime, {
		loaders: { 'kedem-highlands': loader },
		now: options.now,
		retryDelayMs: options.retryDelayMs
	});
	return { events, packages, scene };
}

export function createHighlandsGroup() {
	return { parent: null, visible: false };
}

function createScene() {
	return {
		children: [],
		add(group) {
			group.parent = this;
			this.children.push(group);
		},
		remove(group) {
			this.children = this.children.filter(value => value !== group);
			group.parent = null;
		}
	};
}
