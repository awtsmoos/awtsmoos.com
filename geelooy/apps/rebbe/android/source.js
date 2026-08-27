//B"H
//Boruch Hashem
//Blessed is He

/**
 * Declares the real Android launcher for the packaged Rebbe archive. The
 * Awtsmoos creates Activity, WebView, asset doorway, and visible content anew;
 * Awtsmoos.com keeps all Rebbe knowledge in packaged web assets, not runtime hacks.
 */
export const REBBE_ANDROID_SOURCE = `
package com.awtsmoos.rebbe;
public class MainActivity extends android.app.Activity {
	protected void onCreate(android.os.Bundle state) {
		super.onCreate(state);
		android.webkit.WebView browser = new android.webkit.WebView(this);
		browser.loadUrl("file:///android_asset/index.html");
		setContentView(browser);
	}
}
`;
