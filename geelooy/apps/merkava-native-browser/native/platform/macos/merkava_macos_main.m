/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import <Cocoa/Cocoa.h>
#import "merkava_macos_probe.h"
#import "merkava_macos_view.h"

#include "../../vm/merkava_native_canonical.h"

@interface MerkavaAppDelegate : NSObject <NSApplicationDelegate>
@property(nonatomic, strong) NSWindow* window;
@property(nonatomic, copy) NSString* packagePath;
@property(nonatomic) NSUInteger nodeCount;
@property(nonatomic, assign) AwtsNativeWebRuntime* runtime;
@end

@implementation MerkavaAppDelegate

/** Creates the native window only after canonical execution has succeeded. */
- (void)applicationDidFinishLaunching:(NSNotification*)notification {
	(void)notification;
	NSRect frame = NSMakeRect(0, 0, 1100, 760);
	NSUInteger style = NSWindowStyleMaskTitled
		| NSWindowStyleMaskClosable
		| NSWindowStyleMaskResizable
		| NSWindowStyleMaskMiniaturizable;
	self.window = [[NSWindow alloc] initWithContentRect:frame
		styleMask:style
		backing:NSBackingStoreBuffered
		defer:NO];
