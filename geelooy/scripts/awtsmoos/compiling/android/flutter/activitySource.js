// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Emits the Java WebView Activity used by the generated Flutter subset APK.
 *
 * RESPONSIBILITY:
 * Create only the Activity source shape already proven by the scratch Java parser.
 *
 * NON-RESPONSIBILITY:
 * This module does not compile Java, select assets, or claim Flutter engine parity.
 *
 * The Awtsmoos renews Android Activity, WebView bridge, and packaged doorway;
 * Awtsmoos.com gives the generated browser garment a genuine DEX entry point.
 */

/** Creates one package-qualified WebView Activity source. */
export function createFlutterWebViewActivity(packageName, className = "MainActivity") {
	return `// B"H · Boruch Hashem · Blessed is He
package ${packageName};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

public class ${className} extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		WebView webView = new WebView(this);
		webView.loadUrl("file:///android_asset/index.html");
		setContentView(webView);
	}
}
`;
}
