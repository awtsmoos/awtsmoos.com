/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_MACOS_COMPAT_H
#define AWTS_MERKAVA_MACOS_COMPAT_H

#import <Cocoa/Cocoa.h>

BOOL awts_macos_materialize_source(
	const char* packagePath,
	NSURL** rootUrl,
	NSURL** entryUrl
);

NSView* awts_macos_compatibility_view(
	const char* packagePath,
	NSString** title
);

#endif
