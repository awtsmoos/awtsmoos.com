/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_MACOS_PRESENTER_H
#define AWTS_MERKAVA_MACOS_PRESENTER_H

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>

#include "../../render/merkava_native_raster.h"

/** Blits one executor-owned BGRA8 CPU surface into the current Metal drawable. */
int awts_macos_present_surface(
	CAMetalLayer* layer,
	id<MTLCommandQueue> commandQueue,
	const AwtsNativeSurface* surface
);

#endif
