//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keeps one human-readable source witness for every executable form Geelooy opens.
 * The Awtsmoos renews language, container, visible intention, and rebuilt bytes;
 * Awtsmoos.com stores no opaque witness where a living compiler can testify instead.
 */

const PORTABLE_SOURCE = "int main(){int value=24;return value+5;}";

export const SOURCE_FIXTURES = Object.freeze({
	apk: Object.freeze({
		name: "source-android-gui",
		source: `package com.awtsmoos.matrix;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H source APK inside Geelooy");
		setContentView(view);
	}
}`
	}),
	"app-bundle": Object.freeze({
		name: "source-app-bundle",
		source: PORTABLE_SOURCE
	}),
	awtexe: Object.freeze({
		name: "source-awtexe-gui",
		source: `window "Awtexe Source" "Wasm payload executed";
text "B\\"H wrapped source" 16 38;
pixel 28 18 65535;
return 19;`
	}),
	elf: Object.freeze({
		name: "source-elf",
		source: "int main(){int value=20;return value+3;}"
	}),
	"mach-o": Object.freeze({
		name: "source-macho",
		source: PORTABLE_SOURCE
	}),
	"mach-o-fat": Object.freeze({
		name: "source-fat-macho",
		source: PORTABLE_SOURCE
	}),
	pe: Object.freeze({
		name: "source-pe-gui",
		source: `import "USER32.dll" MessageBoxA;
import "KERNEL32.dll" ExitProcess;
void main() {
	MessageBoxA(0, "B\\\"H source PE inside Geelooy", "Source PE", 0);
	ExitProcess(0);
}`
	}),
	webassembly: Object.freeze({
		name: "source-wasm-gui",
		source: `window "Source Wasm" "Executed imports inside Geelooy";
text "B\\"H source Wasm" 18 42;
pixel 24 32 16711680;
print 613;
return 7;`
	})
});

export function sourceFixture(format) {
	const fixture = SOURCE_FIXTURES[format];
	if (!fixture) {
		const error = new Error(`SOURCE_FIXTURE_MISSING:${format}`);
		error.code = "SOURCE_FIXTURE_MISSING";
		throw error;
	}
	return fixture;
}
