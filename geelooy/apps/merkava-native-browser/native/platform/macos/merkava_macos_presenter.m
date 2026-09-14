/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "merkava_macos_presenter.h"

/** Uploads executor pixels into a temporary shared Metal texture. */
static id<MTLTexture> upload_surface(
	id<MTLDevice> device,
	const AwtsNativeSurface* surface
) {
	MTLTextureDescriptor* descriptor = [MTLTextureDescriptor
		texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
		width:surface->width
		height:surface->height
		mipmapped:NO];
	descriptor.storageMode = MTLStorageModeShared;
	id<MTLTexture> texture = [device newTextureWithDescriptor:descriptor];
	if (!texture) {
		return nil;
	}
	MTLRegion region = MTLRegionMake2D(0, 0, surface->width, surface->height);
	[texture replaceRegion:region
		mipmapLevel:0
		withBytes:surface->pixels
		bytesPerRow:(NSUInteger)surface->width * sizeof(uint32_t)];
	return texture;
}

/** Blits one executor-owned BGRA8 CPU surface into the current drawable. */
int awts_macos_present_surface(
	CAMetalLayer* layer,
	id<MTLCommandQueue> commandQueue,
	const AwtsNativeSurface* surface
) {
	if (!layer || !commandQueue || !surface || !surface->pixels) {
		return 0;
	}
	layer.drawableSize = CGSizeMake(surface->width, surface->height);
	id<CAMetalDrawable> drawable = [layer nextDrawable];
	if (!drawable) {
		return 0;
	}
	id<MTLTexture> source = upload_surface(layer.device, surface);
	if (!source) {
		return 0;
	}
	id<MTLCommandBuffer> commandBuffer = [commandQueue commandBuffer];
	id<MTLBlitCommandEncoder> blit = [commandBuffer blitCommandEncoder];
	MTLSize size = MTLSizeMake(surface->width, surface->height, 1);
	[blit copyFromTexture:source
		sourceSlice:0
		sourceLevel:0
		sourceOrigin:MTLOriginMake(0, 0, 0)
		sourceSize:size
		toTexture:drawable.texture
		destinationSlice:0
		destinationLevel:0
		destinationOrigin:MTLOriginMake(0, 0, 0)];
	[blit endEncoding];
	[commandBuffer presentDrawable:drawable];
	[commandBuffer commit];
	return 1;
}
