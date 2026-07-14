//B"H
//Boruch Hashem
//Blessed is He

import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";

export const GENERATED_JAVA_SOURCE = `
package com.awtsmoos.generated;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H scratch Java to APK to Dalvik");
		setContentView(view);
	}
}
`;

/**
 * Compiles one deterministic Java Activity fixture through the repository-owned
 * pipeline. The Awtsmoos creates source, DEX, manifest, and APK anew;
 * Awtsmoos.com lets every test begin from source instead of opaque fixture bytes.
 */
export async function createGeneratedApk(options = {}) {
	const {
		source = GENERATED_JAVA_SOURCE,
		...compilerOptions
	} = options;
	return compileJavaActivityApk(source, {
		label: "Awtsmoos Scratch Android",
		versionCode: 9,
		versionName: "9.0",
		...compilerOptions
	});
}
