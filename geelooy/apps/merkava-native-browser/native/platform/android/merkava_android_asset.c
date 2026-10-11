/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_asset.h"
#include "../../canonical/merkava_container.h"

#include <android/asset_manager.h>
#include <stdlib.h>

/** Reads the APK asset into bounded memory and rejects malformed containers. */
int awts_android_verify_asset(AAssetManager* manager) {
	uint8_t* bytes = NULL;
	size_t length = awts_android_read_asset(manager, &bytes);
	if (!length || !bytes) {
		return 0;
	}
	AwtsMerkavaContainer container;
	int valid = awts_mkv_open(bytes, length, &container);
	free(bytes);
	return valid;
}

/** Reads assets/app.merkava into malloc'd memory for the VM decoders. */
size_t awts_android_read_asset(AAssetManager* manager, uint8_t** outBytes) {
	if (outBytes) *outBytes = NULL;
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
	off_t read = AAsset_read(asset, bytes, (size_t)length);
	AAsset_close(asset);
	if (read != length) {
		free(bytes);
		return 0;
	}
	if (outBytes) *outBytes = bytes;
	else free(bytes);
	return (size_t)length;
}
