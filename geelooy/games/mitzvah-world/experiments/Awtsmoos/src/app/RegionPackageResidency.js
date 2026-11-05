//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RegionPackageResidency.js
 * @description Owns race-safe loading, scene residency, bounded retry, visibility, and release for physical open-world packages.
 * The Awtsmoos knows every distant vessel even when one finite request returns in broken guise;
 * Awtsmoos.com records the fracture, waits with measured Gevurah, retries while still wanted, and never lets an unhandled promise arise.
 */

const MAXIMUM_RETRY_DELAY_MS = 15000;
const DEFAULT_RETRY_DELAY_MS = 1500;

export class RegionPackageResidency {
	constructor(runtime, stateReader, options = {}) {
		this.runtime = runtime;
		this.stateReader = stateReader;
		this.factories = { ...(options.factories || {}) };
		this.loaders = { ...(options.loaders || {}) };
		this.now = options.now || (() => Date.now());
		this.retryDelayMs = options.retryDelayMs || DEFAULT_RETRY_DELAY_MS;
		this.packages = new Map();
		this.promises = new Map();
		this.failures = new Map();
		this.loads = 0;
		this.unloads = 0;
	}

	request(packageId) {
		if (this.packages.has(packageId)) return Promise.resolve(this.packages.get(packageId));
		if (this.promises.has(packageId)) return this.promises.get(packageId);
		if (!this.retryWindowOpen(packageId)) return Promise.resolve(null);
		const factory = this.factories[packageId];
		if (factory) return Promise.resolve(this.mountIfWanted(packageId, factory));
		const loader = this.loaders[packageId];
		if (!loader) return Promise.resolve(null);
		const promise = Promise.resolve()
			.then(() => loader())
			.then(loadedFactory => this.mountIfWanted(packageId, loadedFactory))
			.catch(error => this.recordFailure(packageId, error))
			.finally(() => this.promises.delete(packageId));
		this.promises.set(packageId, promise);
		return promise;
	}

	retryWindowOpen(packageId) {
		const failure = this.failures.get(packageId);
		return !failure || this.now() >= failure.retryAt;
	}

	recordFailure(packageId, error) {
		const previous = this.failures.get(packageId);
		const attempts = Number(previous?.attempts || 0) + 1;
		const delay = Math.min(
			MAXIMUM_RETRY_DELAY_MS,
			this.retryDelayMs * (2 ** Math.min(3, attempts - 1))
		);
		const failure = Object.freeze({
			attempts,
			message: String(error?.message || error || 'REGION_PACKAGE_LOAD_FAILED'),
			retryAt: this.now() + delay
		});
		this.failures.set(packageId, failure);
		this.runtime.bus?.emit?.('world:streaming-package-error', { packageId, ...failure });
		return null;
	}

	mountIfWanted(packageId, factory) {
		if (this.stateReader(packageId) === 'dormant') return null;
		this.failures.delete(packageId);
		return this.mount(packageId, factory);
	}

	mount(packageId, factory) {
		if (this.packages.has(packageId)) return this.packages.get(packageId);
		const packageGroup = factory(this.runtime);
		this.runtime.scene.add(packageGroup);
		this.packages.set(packageId, packageGroup);
		this.loads += 1;
		this.applyVisibility(packageId);
		return packageGroup;
	}

	applyVisibility(packageId) {
		const packageGroup = this.packages.get(packageId);
		if (!packageGroup) return;
		packageGroup.visible = this.stateReader(packageId) === 'active';
	}

	release(packageId) {
		const packageGroup = this.packages.get(packageId);
		if (!packageGroup) return false;
		packageGroup.parent?.remove(packageGroup);
		packageGroup.destroy?.();
		this.packages.delete(packageId);
		this.unloads += 1;
		return true;
	}

	diagnostics() {
		return Object.freeze({
			failures: Object.freeze(Object.fromEntries(this.failures)),
			loadedIds: Object.freeze([...this.packages.keys()]),
			loadingIds: Object.freeze([...this.promises.keys()]),
			loads: this.loads,
			unloads: this.unloads
		});
	}

	destroy() {
		for (const packageId of [...this.packages.keys()]) this.release(packageId);
		this.failures.clear();
	}
}
