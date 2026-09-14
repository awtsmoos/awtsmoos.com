/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_ASSET_H
#define AWTS_MERKAVA_ANDROID_ASSET_H

#include <android/asset_manager.h>

/** Verifies the packaged assets/app.merkava through the canonical C reader. */
int awts_android_verify_asset(AAssetManager* manager);

#endif
