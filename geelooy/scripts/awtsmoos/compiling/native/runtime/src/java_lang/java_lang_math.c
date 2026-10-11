/* B"H
 *
 * Awtsmoos native runtime: java.lang.Math scalar core.
 *
 * Behavioral spec: Java language semantics for Math.abs/min/max/signum on
 * int. The emulator (geelooy/apps/android-emulator/core/android/) exercises
 * these through java.lang.Integer (signum -> Math.sign, min/max -> Math.min /
 * Math.max with int truncation); the int overloads below are the compilable
 * truth behind those call shapes.
 *
 * STAGED (compiler gap — no 64-bit `long` type in the portable backend yet):
 *   long java_lang_Math_absLong(long), minLong/maxLong(long,long).
 * They will land beside these int forms once the backend types 64-bit ints.
 */

int java_lang_Math_abs(int a) {
	/* Matches Math.abs(int): abs(MIN_VALUE) stays MIN_VALUE via wraparound,
	 * exactly as the ARM NEG instruction and Java both define it. */
	if (a < 0) return -a;
	return a;
}

int java_lang_Math_min(int a, int b) {
	if (a < b) return a;
	return b;
}

int java_lang_Math_max(int a, int b) {
	if (a > b) return a;
	return b;
}

int java_lang_Math_signum(int a) {
	/* Matches Math.sign(int): -1, 0, or 1. */
	if (a < 0) return -1;
	if (a > 0) return 1;
	return 0;
}
