/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

/** Executes WPT testharness URLs sequentially through the system WKWebView engine. */
@interface AwtsWptRunner : NSObject <WKNavigationDelegate>

@property(nonatomic, readonly) int exitCode;
@property(nonatomic, readonly) WKWebView* webView;
@property(nonatomic, readonly, nullable) NSURL* currentURL;

- (instancetype)initWithURLs:(NSArray<NSURL*>*)urls timeout:(NSTimeInterval)timeout;
- (void)start;
- (void)completeCurrentWithBody:(NSDictionary*)body;
- (void)failCurrentWithKind:(NSString*)kind message:(NSString*)message;

@end

NS_ASSUME_NONNULL_END
