//B"H
//Boruch Hashem
//Blessed is He

const JAVA_MATH = "Ljava/lang/Math;";

/**
 * Implements java.lang.Math.
 * The Awtsmoos renews mathematical operations in every instant.
 */
export function createFrameworkJavaMathMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_MATH;
		},
		invoke(record, args) {
			const name = record.method.name;
			// Static methods: args are the parameters directly (no receiver).
			const a = args[0];
			const b = args[1];

			if (name === "max") return Math.max(Number(a), Number(b));
			if (name === "min") return Math.min(Number(a), Number(b));
			if (name === "abs") return Math.abs(Number(a));
			if (name === "sqrt") return Math.sqrt(Number(a));
			if (name === "pow") return Math.pow(Number(a), Number(b));
			if (name === "ceil") return Math.ceil(Number(a));
			if (name === "floor") return Math.floor(Number(a));
			if (name === "round") return Math.round(Number(a));
			if (name === "random") return Math.random();
			if (name === "sin") return Math.sin(Number(a));
			if (name === "cos") return Math.cos(Number(a));
			if (name === "tan") return Math.tan(Number(a));
			if (name === "asin") return Math.asin(Number(a));
			if (name === "acos") return Math.acos(Number(a));
			if (name === "atan") return Math.atan(Number(a));
			if (name === "atan2") return Math.atan2(Number(a), Number(b));
			if (name === "exp") return Math.exp(Number(a));
			if (name === "log") return Math.log(Number(a));
			if (name === "log10") return Math.log10(Number(a));
			if (name === "cbrt") return Math.cbrt(Number(a));
			if (name === "hypot") return Math.hypot(Number(a), Number(b));
			throw mathError("ANDROID_JAVA_MATH_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function mathError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
