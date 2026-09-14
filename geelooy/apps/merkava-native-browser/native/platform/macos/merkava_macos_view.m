/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "merkava_macos_view.h"
#import "merkava_macos_presenter.h"

#include "../../render/merkava_native_layout.h"
#include "../../render/merkava_native_raster.h"

#include <stdint.h>
#include <stdlib.h>

@implementation MerkavaNativeView {
	AwtsNativeWebRuntime* _runtime;
	AwtsNativeLayout _layout;
	AwtsNativeSurface _surface;
	id<MTLCommandQueue> _commandQueue;
}

/** Creates a Metal-backed host view without delegating browser semantics. */
- (instancetype)initWithFrame:(NSRect)frame
	runtime:(AwtsNativeWebRuntime*)runtime {
	self = [super initWithFrame:frame];
	if (!self) {
		return nil;
	}
	_runtime = runtime;
	id<MTLDevice> device = MTLCreateSystemDefaultDevice();
	_commandQueue = [device newCommandQueue];
	self.wantsLayer = YES;
	CAMetalLayer* layer = [CAMetalLayer layer];
	layer.device = device;
	layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
	layer.framebufferOnly = NO;
	self.layer = layer;
	return self;
}

- (BOOL)isFlipped {
	return YES;
}

- (BOOL)acceptsFirstResponder {
	return YES;
}

/** Reallocates the executor-owned CPU framebuffer for the current view size. */
- (BOOL)resizeSurface {
	uint32_t width = (uint32_t)MAX(1.0, floor(self.bounds.size.width));
	uint32_t height = (uint32_t)MAX(1.0, floor(self.bounds.size.height));
	if (_surface.pixels && _surface.width == width && _surface.height == height) {
		return YES;
	}
	if (width > 16384u || height > 16384u) {
		return NO;
	}
	uint32_t* pixels = calloc((size_t)width * height, sizeof(uint32_t));
	if (!pixels) {
		return NO;
	}
	free(_surface.pixels);
	_surface.pixels = pixels;
	_surface.width = width;
	_surface.height = height;
	return YES;
}

/** Rebuilds layout, rasterizes our pixels, and presents the exact CPU surface. */
- (BOOL)renderRuntime {
	if (!_runtime || ![self resizeSurface]) {
		return NO;
	}
	if (!awts_native_layout_build(
		_runtime,
		(float)_surface.width,
		(float)_surface.height,
		&_layout
	)) {
		return NO;
	}
	if (!awts_native_raster_layout(&_layout, &_surface)) {
		return NO;
	}
	return awts_macos_present_surface(
		(CAMetalLayer*)self.layer,
		_commandQueue,
		&_surface
	) != 0;
}

/** Routes real macOS pointer input through executor hit testing and VM events. */
- (void)mouseDown:(NSEvent*)event {
	NSPoint point = [self convertPoint:event.locationInWindow fromView:nil];
	uint32_t handle = awts_native_layout_hit_test(&_layout, point.x, point.y);
	if (handle && awts_native_web_trigger(_runtime, handle, "click")) {
		[self renderRuntime];
	}
}

/** Keeps the executor framebuffer synchronized with native window resizing. */
- (void)setFrameSize:(NSSize)newSize {
	[super setFrameSize:newSize];
	if (_runtime) {
		[self renderRuntime];
	}
}

- (void)dealloc {
	free(_surface.pixels);
}

@end
