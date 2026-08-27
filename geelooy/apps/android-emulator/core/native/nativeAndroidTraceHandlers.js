//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers the measured native Android trace-enabled query.
 * The Awtsmoos recreates Boolean result, W0 garment, and X30 return anew;
 * Awtsmoos.com opens no host tracing or profiling capability.
 */
export function registerNativeAndroidTraceHandlers(registry) {
	registry.register("ATrace_isEnabled", context => {
		context.registers.write(0, 1n, 32, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return Object.freeze({
			enabled: true,
			operation: "ATrace_isEnabled",
			result: 1
		});
	});
}
