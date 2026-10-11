/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_ASSET_H
#define AWTS_MERKAVA_ANDROID_ASSET_H

#include <android/asset_manager.h>
#include <stddef.h>
#include <stdint.h>

/** Verifies the packaged assets/app.merkava through the canonical C reader. */
int awts_android_verify_asset(AAssetManager* manager);

/**
 * Reads assets/app.merkava into malloc'd memory.
 * Returns byte count (>0) on success with *outBytes set; 0 on failure.
 * Caller frees with free().
 */
size_t awts_android_read_asset(AAssetManager* manager, uint8_t** outBytes);

#endif
