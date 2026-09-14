/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "WptRunner.h"
#import "WptHarnessScript.h"

@interface AwtsWptRunner ()
@property(nonatomic) NSArray<NSURL*>* urls;
@property(nonatomic) NSInteger index;
@property(nonatomic) NSTimeInterval timeout;
@property(nonatomic) NSTimer* timer;
@property(nonatomic) NSWindow* window;
@property(nonatomic, readwrite) WKWebView* webView;
@property(nonatomic, readwrite, nullable) NSURL* currentURL;
@property(nonatomic, readwrite) int exitCode;
@property(nonatomic) NSUInteger passedPages;
@property(nonatomic) NSUInteger failedPages;
@property(nonatomic) NSUInteger passedSubtests;
@property(nonatomic) NSUInteger failedSubtests;
@end

@implementation AwtsWptRunner

/** Builds one isolated WebKit execution vessel with the WPT reporting hook. */
- (instancetype)initWithURLs:(NSArray<NSURL*>*)urls timeout:(NSTimeInterval)timeout {
	if (!(self = [super init])) return nil;
	_urls = urls;
	_timeout = timeout;
	WKWebViewConfiguration* configuration = [WKWebViewConfiguration new];
	configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
	[configuration.userContentController addScriptMessageHandler:(id<WKScriptMessageHandler>)self name:@"awtsWpt"];
	WKUserScript* script = [[WKUserScript alloc] initWithSource:AwtsWptHarnessScript()
		injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:NO];
	[configuration.userContentController addUserScript:script];
	_webView = [[WKWebView alloc] initWithFrame:NSMakeRect(0, 0, 1024, 768)
		configuration:configuration];
	_webView.navigationDelegate = self;
	_window = [[NSWindow alloc] initWithContentRect:_webView.frame styleMask:0
		backing:NSBackingStoreBuffered defer:NO];
	_window.contentView = _webView;
	return self;
}

/** Starts sequential execution; the run loop remains owned by the CLI main. */
- (void)start {
	[self loadNext];
}

/** Converts authoritative testharness completion data into one page result. */
- (void)completeCurrentWithBody:(NSDictionary*)body {
	NSArray* tests = [body[@"tests"] isKindOfClass:NSArray.class] ? body[@"tests"] : @[];
	NSUInteger passed = 0;
	NSUInteger failed = 0;
	for (NSDictionary* test in tests) {
		NSInteger status = [test[@"status"] integerValue];
		if (status == 0) passed += 1;
		else failed += 1;
	}
	NSInteger harnessStatus = [body[@"harnessStatus"] integerValue];
	BOOL pagePassed = harnessStatus == 0 && failed == 0;
	_passedSubtests += passed;
	_failedSubtests += failed;
	pagePassed ? _passedPages++ : _failedPages++;
	[self emit:@{ @"kind": @"testharness", @"url": self.currentURL.absoluteString ?: @"",
		@"harnessStatus": @(harnessStatus), @"passed": @(passed), @"failed": @(failed),
		@"pagePassed": @(pagePassed), @"tests": tests }];
	[self advance];
}

/** Records navigation, timeout, or missing-harness failure without hiding it. */
- (void)failCurrentWithKind:(NSString*)kind message:(NSString*)message {
	_failedPages += 1;
	[self emit:@{ @"kind": kind, @"url": self.currentURL.absoluteString ?: @"",
		@"pagePassed": @NO, @"message": message ?: @"" }];
	[self advance];
}

/** Loads the next URL and arms a bounded per-page timeout. */
- (void)loadNext {
	if (_index >= (NSInteger)_urls.count) return [self finish];
	self.currentURL = _urls[_index];
	[_timer invalidate];
	_timer = [NSTimer scheduledTimerWithTimeInterval:_timeout target:self
		selector:@selector(timeoutCurrent) userInfo:nil repeats:NO];
	[_webView loadRequest:[NSURLRequest requestWithURL:self.currentURL]];
}

- (void)timeoutCurrent {
	[self failCurrentWithKind:@"timeout" message:@"WPT page exceeded native runner timeout"];
}

/** Advances exactly once after one terminal page result. */
- (void)advance {
	[_timer invalidate];
	_timer = nil;
	_index += 1;
	[self loadNext];
}

/** Emits machine-readable evidence without mixing human formatting into results. */
- (void)emit:(NSDictionary*)value {
	NSData* data = [NSJSONSerialization dataWithJSONObject:value options:0 error:nil];
	fwrite(data.bytes, 1, data.length, stdout);
	fputc('\n', stdout);
	fflush(stdout);
}

/** Emits aggregate counts and returns control to main with failure-sensitive status. */
- (void)finish {
	self.exitCode = _failedPages == 0 ? 0 : 1;
	[self emit:@{ @"kind": @"summary", @"pages": @(_urls.count),
		@"passedPages": @(_passedPages), @"failedPages": @(_failedPages),
		@"passedSubtests": @(_passedSubtests), @"failedSubtests": @(_failedSubtests) }];
	[NSApp stop:nil];
}

@end
