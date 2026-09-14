/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "merkava_macos_compat.h"
#import <WebKit/WebKit.h>

#include "../../canonical/merkava_container.h"
#include "../../canonical/merkava_source_archive.h"
#include "../common/merkava_file_loader.h"

/** Converts one bounded UTF-8 package path into an NSString. */
static NSString* text_value(const uint8_t* bytes, uint32_t length) {
	return [[NSString alloc] initWithBytes:bytes
		length:length encoding:NSUTF8StringEncoding];
}

/** Writes one exact source record beneath an isolated temporary root. */
static BOOL write_record(
	NSFileManager* manager,
	NSURL* root,
	const AwtsMerkavaSourceRecord* record
) {
	NSString* path = text_value(record->path, record->pathLength);
	if (!path) return NO;
	NSURL* file = [root URLByAppendingPathComponent:[path substringFromIndex:1]];
	NSURL* parent = [file URLByDeletingLastPathComponent];
	if (![manager createDirectoryAtURL:parent
		withIntermediateDirectories:YES attributes:nil error:nil]) return NO;
	NSData* data = [NSData dataWithBytes:record->data length:record->dataLength];
	return [data writeToURL:file options:NSDataWritingAtomic error:nil];
}

/** Materializes the verified SOURCE section for a mature WebKit compatibility lane. */
BOOL awts_macos_materialize_source(
	const char* packagePath,
	NSURL** rootUrl,
	NSURL** entryUrl
) {
	AwtsFileBytes file;
	if (!awts_read_file_bytes(packagePath, &file)) return NO;
	AwtsMerkavaContainer container;
	AwtsMerkavaSection section;
	BOOL valid = awts_mkv_open(file.bytes, file.length, &container)
		&& awts_mkv_find_section(&container, AWTS_MKV_SECTION_SOURCE, &section);
	AwtsMerkavaSourceArchive archive;
	if (valid) valid = awts_mkv_source_open(
		awts_mkv_section_bytes(&container, &section),
		section.length,
		&archive
	);
	NSFileManager* manager = [NSFileManager defaultManager];
	NSString* directory = [NSTemporaryDirectory() stringByAppendingPathComponent:
		[NSString stringWithFormat:@"merkava-%@", NSUUID.UUID.UUIDString]];
	NSURL* root = [NSURL fileURLWithPath:directory isDirectory:YES];
	if (valid) valid = [manager createDirectoryAtURL:root
		withIntermediateDirectories:YES attributes:nil error:nil];
	for (uint32_t index = 0; valid && index < archive.fileCount; index += 1) {
		AwtsMerkavaSourceRecord record;
		valid = awts_mkv_source_record(&archive, index, &record)
			&& write_record(manager, root, &record);
	}
	NSString* entry = valid
		? text_value(archive.bytes + archive.entryOffset, archive.entryLength)
		: nil;
	NSURL* entryFile = entry
		? [root URLByAppendingPathComponent:[entry substringFromIndex:1]]
		: nil;
	awts_free_file_bytes(&file);
	if (!valid || !entryFile) return NO;
	if (rootUrl) *rootUrl = root;
	if (entryUrl) *entryUrl = entryFile;
	return YES;
}

/** Creates a real WKWebView using system DOM, CSS, fonts, layout, and JavaScript. */
NSView* awts_macos_compatibility_view(const char* packagePath, NSString** title) {
	NSURL* root = nil;
	NSURL* entry = nil;
	if (!awts_macos_materialize_source(packagePath, &root, &entry)) return nil;
	WKWebViewConfiguration* configuration = [WKWebViewConfiguration new];
	configuration.preferences.javaScriptCanOpenWindowsAutomatically = YES;
	WKWebView* view = [[WKWebView alloc] initWithFrame:NSZeroRect configuration:configuration];
	view.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
	[view loadFileURL:entry allowingReadAccessToURL:root];
	if (title) *title = [NSString stringWithFormat:@"Merkava — %@", entry.lastPathComponent];
	return view;
}
