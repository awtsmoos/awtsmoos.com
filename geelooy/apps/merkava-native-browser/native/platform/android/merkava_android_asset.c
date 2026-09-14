/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_asset.h"
#include "../../canonical/merkava_container.h"

#include <android/asset_manager.h>
#include <stdlib.h>

/** Reads the APK asset into bounded memory and rejects malformed containers. */
int awts_android_verify_asset(AAssetManager* manager) {
	if (!manager) {
		return 0;
	}
	AAsset* asset = AAssetManager_open(manager, "app.merkava", AASSET_MODE_BUFFER);
	if (!asset) {
		return 0;
	}
	off_t length = AAsset_getLength(asset);
	if (length <= 0) {
		AAsset_close(asset);
		return 0;
	}
	uint8_t* bytes = (uint8_t*)malloc((size_t)length);
	if (!bytes) {
		AAsset_close(asset);
		return 0;
	}
	int read = AAsset_read(asset, bytes, (size_t)length);
	AAsset_close(asset);
	AwtsMerkavaContainer container;
	int valid = read == length && awts_mkv_open(bytes, (size_t)length, &container);
	free(bytes);
	return valid;
}
