/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "WptRunner.h"

@interface AwtsWptRunner (Delegates) <WKScriptMessageHandler>
@end

@implementation AwtsWptRunner (Delegates)

/** Accepts only the main-frame WPT completion bridge to prevent iframe races. */
- (void)userContentController:(WKUserContentController*)controller
	didReceiveScriptMessage:(WKScriptMessage*)message {
	(void)controller;
	if (!message.frameInfo.mainFrame) return;
	if (![message.body isKindOfClass:NSDictionary.class]) return;
	NSDictionary* body = message.body;
	NSString* kind = [body[@"kind"] isKindOfClass:NSString.class] ? body[@"kind"] : @"";
	if ([kind isEqualToString:@"complete"]) {
		[self completeCurrentWithBody:body];
		return;
	}
	if ([kind isEqualToString:@"no-harness"]) {
		[self failCurrentWithKind:@"no-harness" message:@"Page did not install WPT testharness"];
	}
}

/** Reports provisional navigation failure as a terminal WPT page result. */
- (void)webView:(WKWebView*)webView didFailProvisionalNavigation:(WKNavigation*)navigation
	withError:(NSError*)error {
	(void)webView;
	(void)navigation;
	[self failCurrentWithKind:@"navigation-error" message:error.localizedDescription];
}

/** Reports committed navigation failure instead of allowing an invisible timeout. */
- (void)webView:(WKWebView*)webView didFailNavigation:(WKNavigation*)navigation
	withError:(NSError*)error {
	(void)webView;
	(void)navigation;
	[self failCurrentWithKind:@"navigation-error" message:error.localizedDescription];
}

/** Trusts only the test server's localhost TLS challenge for WPT HTTPS pages. */
- (void)webView:(WKWebView*)webView didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge*)challenge
	completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential* _Nullable))completionHandler {
	(void)webView;
	if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]
		&& [challenge.protectionSpace.host hasSuffix:@"localhost"]
		&& challenge.protectionSpace.serverTrust) {
		completionHandler(NSURLSessionAuthChallengeUseCredential,
			[NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust]);
		return;
	}
	completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}

@end
