/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_GLYPHS_H
#define AWTS_MERKAVA_NATIVE_GLYPHS_H

#include <stdint.h>

/** Returns seven 5-bit rows for one ASCII glyph in the built-in fallback font. */
const uint8_t* awts_native_ascii_glyph(uint8_t character);

#endif
