/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_web.h"

#include <stdio.h>

static int rejects(const uint8_t* bytes, size_t length) {
	AwtsNativeWebRuntime runtime;
	return !awts_native_web_execute(bytes, length, &runtime);
}

int main(void) {
	const uint8_t badMagic[] = {
		'B', 'A', 'D', '4',
		1, 0, 1, 0
	};
	const uint8_t unknownOpcode[] = {
		'M', 'W', 'B', '4',
		1,
		0,
		2,
		99,
		0
	};
	const uint8_t missingEnd[] = {
		'M', 'W', 'B', '4',
		1,
		0,
		1,
		1
	};

	if (!rejects(badMagic, sizeof(badMagic))) {
		return 2;
	}
	if (!rejects(unknownOpcode, sizeof(unknownOpcode))) {
		return 3;
	}
	if (!rejects(missingEnd, sizeof(missingEnd))) {
		return 4;
	}

	printf("native_web_rejection_ok\n");
	return 0;
}
