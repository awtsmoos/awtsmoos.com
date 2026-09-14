/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_SOURCE_MATERIALIZER_H
#define AWTS_MERKAVA_SOURCE_MATERIALIZER_H

#include <stddef.h>

int awts_materialize_merkava_source(
	const char* packagePath,
	char* rootPath,
	size_t rootCapacity,
	char* entryPath,
	size_t entryCapacity
);

#endif
