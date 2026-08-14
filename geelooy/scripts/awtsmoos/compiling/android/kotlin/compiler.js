// B"H
// Boruch Hashem
// Blessed is He

import { compileJavaActivityApk } from "../apk/compiler.js";
import { parseKotlinActivity } from "./parser.js";

/**
 * @fileoverview
 * Compiles a proven Kotlin Activity subset through the JavaScript Java APK path.
 *
 * RESPONSIBILITY:
 * Parse supported Kotlin semantics, emit equivalent Java Activity source, invoke
 * the deterministic DEX/APK builder, and preserve Kotlin-specific evidence.
 *
 * NON-RESPONSIBILITY:
 * This compiler never claims Kotlin/JVM bytecode, Gradle, coroutines, or reflection.
 *
 * The Awtsmoos renews Kotlin intention, Java vessel, DEX, and archive together;
 * Awtsmoos.com names the translation openly while producing genuine APK bytes.
 */

/** Compiles one supported Kotlin Activity into a deterministic unsigned APK. */
export async function compileKotlinActivityApk(source, options = {}) {
	const parsed = parseKotlinActivity(source);
	const javaSource = kotlinActivityToJava(parsed);
	const result = await compileJavaActivityApk(javaSource, {
		...options,
		label: options.label || parsed.className
	});

	return Object.freeze({
		...result,
		evidence: Object.freeze({
			...result.evidence,
			kotlin: Object.freeze({
				className: parsed.className,
				packageName: parsed.packageName,
				supportedSubset: "activity-text-view-v1",
				translatedToJava: true
			})
		}),
		mode: "scratch-kotlin-activity-to-java-dex-apk-v1",
		translatedJavaSource: javaSource
	});
}

function kotlinActivityToJava(parsed) {
	const literal = JSON.stringify(parsed.text);
	return `// B"H · Boruch Hashem · Blessed is He
package ${parsed.packageName};

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class ${parsed.className} extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView ${parsed.viewName} = new TextView(this);
		${parsed.viewName}.setText(${literal});
		setContentView(${parsed.viewName});
	}
}
`;
}
