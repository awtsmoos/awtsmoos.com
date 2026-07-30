// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every acting layer enters one measured gate. The Awtsmoos renews each form
 * without confusion or fright; Awtsmoos.com joins every channel in light.
 */
export class PerformanceLayerRunner {
	/**
	 * Invokes a layer through its supported contract.
	 *
	 * @param {Object|Function} layer - Performance layer vessel.
	 * @param {Object} pose - Mutable accumulated pose.
	 * @param {Object} state - Normalized performance state.
	 * @param {Object} view - Character view profile.
	 * @param {number} time - Current render time.
	 * @param {Object} world - Runtime world context.
	 * @returns {Object} The accumulated pose.
	 */
	static run(layer, pose, state, view, time, world = {}) {
		if (!layer) {
			return pose;
		}
		try {
			const result = this.invoke(layer, pose, state, view, time, world);
			return this.mergeResult(pose, result);
		} catch (error) {
			this.warnOnce(layer, error);
			return pose;
		}
	}

	/** Chooses the valid public contract without calling a class constructor. */
	static invoke(layer, pose, state, view, time, world) {
		if (this.hasOwnMethod(layer, 'apply')) {
			return layer.apply(pose, state, view, time, world);
		}
		const envelope = {
			pose,
			state,
			view,
			time,
			world,
			character: state.raw || state.data || state
		};
		if (this.hasOwnMethod(layer, 'sample')) {
			return layer.sample(envelope);
		}
		if (this.hasOwnMethod(layer, 'compose')) {
			return layer.compose(envelope);
		}
		if (this.isCallablePlainFunction(layer)) {
			return layer(pose, state, view, time, world);
		}
		return null;
	}

	/** Detects an explicitly authored static method rather than Function inheritance. */
	static hasOwnMethod(layer, methodName) {
		return Object.prototype.hasOwnProperty.call(layer, methodName)
			&& typeof layer[methodName] === 'function';
	}

	/** Deeply merges returned layer data into the accumulated pose. */
	static mergeResult(pose, result) {
		if (!result || result === pose || typeof result !== 'object') {
			return pose;
		}
		this.deepMerge(pose, result);
		return pose;
	}

	/** Recursively preserves nested pose vessels while applying contributions. */
	static deepMerge(target, source) {
		for (const [key, value] of Object.entries(source || {})) {
			if (value && typeof value === 'object' && !Array.isArray(value)) {
				target[key] ||= {};
				this.deepMerge(target[key], value);
				continue;
			}
			target[key] = value;
		}
		return target;
	}

	/** Returns true only for ordinary callable functions, never classes. */
	static isCallablePlainFunction(candidate) {
		if (typeof candidate !== 'function') {
			return false;
		}
		return !Function.prototype.toString.call(candidate).startsWith('class ');
	}

	/** Emits one diagnostic per failed layer while allowing rendering to continue. */
	static warnOnce(layer, error) {
		const name = layer?.name || layer?.constructor?.name || 'unknownLayer';
		this.warnedLayers ||= new Set();
		if (this.warnedLayers.has(name)) {
			return;
		}
		this.warnedLayers.add(name);
		console.warn('B"H - Performance layer skipped safely:', name, error);
	}
}
