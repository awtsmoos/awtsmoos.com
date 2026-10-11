/* B"H
 *
 * Awtsmoos native runtime: java.lang.Integer core.
 *
 * Behavioral spec: the emulator's
 *   geelooy/apps/android-emulator/core/android/frameworkJavaIntegerValues.js
 * (parseJavaInteger, compareJavaIntegers, normalizeJavaInteger) and
 *   geelooy/apps/android-emulator/core/android/frameworkJavaIntegers.js
 * (signum/compare/min/max/sum/toString/toHexString/toOctalString/
 * toBinaryString/parseInt).
 *
 * Error convention: Java throws NumberFormatException; C has no exceptions,
 * so parseInt reports success through an out-parameter:
 *   returns 1 and stores *out on success, returns 0 (*out untouched) when
 *   the radix is outside 2..36, the text is empty or a lone sign, a digit
 *   is invalid for the radix, or the value overflows int32.
 * toString variants NUL-terminate `out` and return the character count
 * excluding the terminator. Callers must provide 34 bytes (32 binary
 * digits + sign + NUL, the worst case).
 */

int java_lang_Integer_bitCount(int v) {
	int count = 0;
	int x = v;
	int i = 0;
	/* Exactly 32 iterations: arithmetic shift keeps the sign bit, so a
	 * `while (x != 0)` loop would never terminate on negative inputs. */
	while (i < 32) {
		count = count + (x & 1);
		x = x >> 1;
		i = i + 1;
	}
	return count;
}

int java_lang_Integer_numberOfLeadingZeros(int v) {
	int n = 0;
	int x = v;
	if (x == 0) return 32;
	/* Binary search over the 32 bits, high half first. Each left shift
	 * only runs after the shifted-out half proved zero, so no bit is
	 * ever lost; `>>` is arithmetic, which is exactly right here. */
	if ((x >> 16) == 0) { n = n + 16; x = x << 16; }
	if ((x >> 24) == 0) { n = n + 8; x = x << 8; }
	if ((x >> 28) == 0) { n = n + 4; x = x << 4; }
	if ((x >> 30) == 0) { n = n + 2; x = x << 2; }
	if ((x >> 31) == 0) { n = n + 1; }
	return n;
}

int java_lang_Integer_signum(int v) {
	/* Matches the emulator: Math.sign(normalizeJavaInteger(v)). */
	if (v < 0) return -1;
	if (v > 0) return 1;
	return 0;
}

int java_lang_Integer_compare(int a, int b) {
	/* Matches compareJavaIntegers. */
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}

int java_lang_Integer_min(int a, int b) {
	if (a < b) return a;
	return b;
}

int java_lang_Integer_max(int a, int b) {
	if (a > b) return a;
	return b;
}

int java_lang_Integer_sum(int a, int b) {
	return a + b;
}

/* Digit codec shared by parseInt/toString. Matches integerDigit in the
 * emulator: 0-9, A-Z, a-z; anything else is -1. */
int java_lang_Integer_digitValue(int c) {
	if (c >= 48 && c <= 57) return c - 48;
	if (c >= 65 && c <= 90) return c - 55;
	if (c >= 97 && c <= 122) return c - 87;
	return -1;
}

/* Inverse codec for toString: 0-9 then a-z, mirroring JS Number.toString(radix). */
int java_lang_Integer_toDigitChar(int d) {
	if (d >= 0 && d <= 9) return d + 48;
	if (d >= 10 && d <= 35) return d + 87;
	return -1;
}

int java_lang_Integer_parseInt(char *s, int radix, int *out) {
	char *p = s;
	int negative = 0;
	int first;
	int limit;
	int multmin;
	int result = 0;
	int digit;
	if (radix < 2 || radix > 36) return 0;
	first = *p;
	if (first == 43 || first == 45) {
		if (first == 45) negative = 1;
		p = p + 1;
	}
	if (*p == 0) return 0;
	/* OpenJDK-style negative accumulation: exact for -2147483648, which
	 * has no positive int32 counterpart. (-2147483647 - 1) avoids the
	 * out-of-range literal 2147483648. */
	limit = -2147483647;
	if (negative) limit = -2147483647 - 1;
	multmin = limit / radix;
	while (*p != 0) {
		digit = java_lang_Integer_digitValue(*p);
		if (digit < 0 || digit >= radix) return 0;
		if (result < multmin) return 0;
		result = result * radix;
		if (result < limit + digit) return 0;
		result = result - digit;
		p = p + 1;
	}
	if (negative) *out = result;
	else *out = -result;
	return 1;
}

int java_lang_Integer_toStringRadix(int value, char *out, int radix) {
	char buf[34];
	int len = 0;
	int v = value;
	int negative = 0;
	char *p;
	int n = 0;
	int i;
	int digit;
	if (radix < 2 || radix > 36) return 0;
	if (v < 0) negative = 1;
	if (v == 0) {
		buf[0] = 48;
		len = 1;
	} else {
		/* Digits are pulled from the (possibly negative) value with
		 * truncating / and %: exact for -2147483648 with no negation. */
		while (v != 0) {
			digit = v % radix;
			if (digit < 0) digit = -digit;
			buf[len] = java_lang_Integer_toDigitChar(digit);
			len = len + 1;
			v = v / radix;
		}
	}
	p = out;
	if (negative) {
		*p = 45;
		p = p + 1;
		n = 1;
	}
	i = len - 1;
	while (i >= 0) {
		*p = buf[i];
		p = p + 1;
		n = n + 1;
		i = i - 1;
	}
	*p = 0;
	return n;
}

int java_lang_Integer_toString(int value, char *out) {
	return java_lang_Integer_toStringRadix(value, out, 10);
}

/* Unsigned views of the bit pattern, matching the emulator's
 * (value >>> 0).toString(radix). `>>` is arithmetic, but masking the low
 * bits after the shift yields the exact logical digit wherever the mask
 * covers only real bits (see the octal top-digit note below). */
int java_lang_Integer_toHexString(int value, char *out) {
	char *p = out;
	int n = 0;
	int shift = 28;
	int started = 0;
	int d;
	while (shift >= 0) {
		d = (value >> shift) & 15;
		if (d != 0 || started != 0 || shift == 0) {
			started = 1;
			*p = java_lang_Integer_toDigitChar(d);
			p = p + 1;
			n = n + 1;
		}
		shift = shift - 4;
	}
	*p = 0;
	return n;
}

int java_lang_Integer_toOctalString(int value, char *out) {
	char *p = out;
	int n = 0;
	int shift = 30;
	int started = 0;
	int d;
	while (shift >= 0) {
		int mask = 7;
		/* The top octal digit covers only bits 31-30, so it masks 2 bits;
		 * every lower digit covers a full 3 bits. */
		if (shift == 30) mask = 3;
		d = (value >> shift) & mask;
		if (d != 0 || started != 0 || shift == 0) {
			started = 1;
			*p = java_lang_Integer_toDigitChar(d);
			p = p + 1;
			n = n + 1;
		}
		shift = shift - 3;
	}
	*p = 0;
	return n;
}

int java_lang_Integer_toBinaryString(int value, char *out) {
	char *p = out;
	int n = 0;
	int shift = 31;
	int started = 0;
	int d;
	while (shift >= 0) {
		d = (value >> shift) & 1;
		if (d != 0 || started != 0 || shift == 0) {
			started = 1;
			*p = java_lang_Integer_toDigitChar(d);
			p = p + 1;
			n = n + 1;
		}
		shift = shift - 1;
	}
	*p = 0;
	return n;
}
