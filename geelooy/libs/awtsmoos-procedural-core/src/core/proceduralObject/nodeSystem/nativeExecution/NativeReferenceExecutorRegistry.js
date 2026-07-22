// B"H
// Boruch Hashem
// Blessed is He
/** Reference execution is explicit, inspectable, and independent from GPU backends. */

export class NativeReferenceExecutorRegistry {
	#executors = new Map();
	#aliases = new Map();

	register(type, executor) {
		if (typeof type !== "string" || typeof executor !== "function") {
			throw new TypeError("Executor registration requires a type and function.");
		}
		this.#executors.set(type, executor);
		return this;
	}

	alias(aliasType, targetType) {
		if (!this.#executors.has(targetType)) {
			throw new Error(`Cannot alias missing executor: ${targetType}`);
		}
		this.#aliases.set(aliasType, targetType);
		return this;
	}

	has(type) {
		return this.#executors.has(type)
			|| this.#executors.has(this.#aliases.get(type));
	}

	resolve(type) {
		return this.#executors.get(type)
			?? this.#executors.get(this.#aliases.get(type))
			?? null;
	}

	list() {
		return Object.freeze([
			...this.#executors.keys(),
			...this.#aliases.keys()
		].sort());
	}

	execute(type, inputs = {}, config = {}, context = {}) {
		const executor = this.resolve(type);
		if (!executor) {
			throw new Error(`No native reference executor for ${type}`);
		}
		return executor(inputs, config, context);
	}
}
