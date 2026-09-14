/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import <Cocoa/Cocoa.h>
#import "WptRunner.h"

/** Reads newline-delimited absolute WPT URLs while ignoring blank/comment lines. */
static NSArray<NSURL*>* read_urls(NSString* path) {
	NSError* error = nil;
	NSString* text = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:&error];
	if (!text) {
		fprintf(stderr, "wpt_list_read_failed=%s\n", error.localizedDescription.UTF8String);
		return @[];
	}
	NSMutableArray<NSURL*>* urls = [NSMutableArray array];
	for (NSString* raw in [text componentsSeparatedByCharactersInSet:NSCharacterSet.newlineCharacterSet]) {
		NSString* line = [raw stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
		if (!line.length || [line hasPrefix:@"#"]) continue;
		NSURL* url = [NSURL URLWithString:line];
		if (url) [urls addObject:url];
	}
	return urls;
}

/** Runs real WPT testharness pages inside the same WKWebView engine as compatibility mode. */
int main(int argc, const char* argv[]) {
	@autoreleasepool {
		if (argc < 2) {
			fprintf(stderr, "usage: merkava-wpt <url-list> [timeout-seconds]\n");
			return 64;
		}
		NSArray<NSURL*>* urls = read_urls([NSString stringWithUTF8String:argv[1]]);
		if (!urls.count) return 65;
		NSTimeInterval timeout = argc >= 3 ? MAX(1.0, atof(argv[2])) : 30.0;
		[NSApplication sharedApplication];
		NSApp.activationPolicy = NSApplicationActivationPolicyProhibited;
		AwtsWptRunner* runner = [[AwtsWptRunner alloc] initWithURLs:urls timeout:timeout];
		[runner start];
		[NSApp run];
		return runner.exitCode;
	}
}
