/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_MWB4_H
#define AWTS_MERKAVA_ANDROID_MWB4_H

#include <stddef.h>
#include <stdint.h>

/** One decoded text run from the MWB4 bytecode. */
typedef struct AwtsMwb4Text {
	char* text;          /* NUL-terminated UTF-8 (ASCII-safe subset used). */
	uint32_t handle;     /* DOM handle that owns this text. */
	float r, g, b;       /* Resolved text color (defaults to near-white). */
	int isHeading;       /* 1 when the owning tag is h1..h6. */
} AwtsMwb4Text;

/** Decoded MWB4 document: string pool + text runs in document order. */
typedef struct AwtsMwb4Doc {
	char* appName;            /* From container manifest (may be NULL). */
	AwtsMwb4Text* texts;      /* Text runs. */
	size_t textCount;
	size_t nodeCount;         /* CREATE_NODE ops seen. */
	size_t styleCount;        /* SET_STYLE ops seen. */
	int ok;
} AwtsMwb4Doc;

/**
 * Decodes the BYTECODE (MWB4) section of an opened MKV1 container.
 * manifestBytes/manifestLen: raw MANIFEST section (for the app name), may be NULL.
 * Returns 1 on success (doc->ok set); call awts_mwb4_free() when done.
 */
int awts_mwb4_decode(
	const uint8_t* mwb4, size_t mwb4Len,
	const uint8_t* manifestBytes, size_t manifestLen,
	AwtsMwb4Doc* out
);

void awts_mwb4_free(AwtsMwb4Doc* doc);

#endif
