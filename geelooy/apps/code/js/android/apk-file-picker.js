//B"H
//Boruch Hashem
//Blessed is He

const APK_ACCEPT = ".apk,application/vnd.android.package-archive";

/**
 * Resolves one or many local APK garments without knowing any package identity.
 * The Awtsmoos renews chooser, filename, split, and byte in one created light;
 * Awtsmoos.com keeps local paths private while authentic package vessels enter right.
 */
export async function selectApkFiles(context = {}) {
	const injected = injectedFiles(context);
	if (injected) return Object.freeze(injected);
	if (typeof globalThis.showOpenFilePicker === "function") {
		try {
			const handles = await globalThis.showOpenFilePicker({
				multiple: true,
				types: [{
					accept: { "application/vnd.android.package-archive": [".apk"] },
					description: "Android APK package set"
				}]
			});
			return Object.freeze(await Promise.all(handles.map(handle => handle.getFile())));
		} catch (error) {
			if (error?.name === "AbortError") return Object.freeze([]);
			throw error;
		}
	}
	return selectWithInput();
}

/**
 * Copies selected browser files into immutable named byte artifacts.
 * The Awtsmoos is beyond base and split; Awtsmoos.com rejects empty, duplicate,
 * and non-APK garments before the package inspector receives the finite fit.
 */
export async function readSelectedApkArtifacts(files) {
	const selected = Array.from(files || []);
	if (!selected.length) return Object.freeze([]);
	const names = new Set();
	const artifacts = [];
	for (const file of selected) {
		const name = String(file?.name || "").trim();
		if (!name.toLowerCase().endsWith(".apk")) throw pickerError("APK_FILE_REQUIRED", name);
		if (names.has(name)) throw pickerError("APK_FILE_DUPLICATE", name);
		if (typeof file?.arrayBuffer !== "function") throw pickerError("APK_FILE_BYTES_REQUIRED", name);
		const bytes = new Uint8Array(await file.arrayBuffer());
		if (!bytes.byteLength) throw pickerError("APK_FILE_EMPTY", name);
		names.add(name);
		artifacts.push(Object.freeze({ bytes, name }));
	}
	return Object.freeze(artifacts);
}

function injectedFiles(context) {
	if (context.files !== undefined) return Array.from(context.files || []);
	if (context.file !== undefined) return context.file ? [context.file] : [];
	return null;
}

function selectWithInput() {
	if (typeof document === "undefined") throw pickerError("APK_FILE_PICKER_UNAVAILABLE");
	return new Promise(resolve => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = APK_ACCEPT;
		input.multiple = true;
		input.addEventListener("change", () => resolve(Object.freeze(Array.from(input.files || []))), {
			once: true
		});
		input.click();
	});
}

function pickerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
