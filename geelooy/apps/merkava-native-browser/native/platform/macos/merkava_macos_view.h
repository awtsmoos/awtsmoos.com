/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_MACOS_VIEW_H
#define AWTS_MERKAVA_MACOS_VIEW_H

#import <Cocoa/Cocoa.h>

#include "../../vm/merkava_native_web.h"

@interface MerkavaNativeView : NSView

/** Creates an interactive native view backed by one executed Merkava runtime. */
- (instancetype)initWithFrame:(NSRect)frame
	runtime:(AwtsNativeWebRuntime*)runtime;

/** Rebuilds layout, rerasterizes CPU pixels, and presents them through Metal. */
- (BOOL)renderRuntime;

@end

#endif
