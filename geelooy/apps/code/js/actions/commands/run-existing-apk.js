//B"H
//Boruch Hashem
//Blessed is He

import { readSelectedApkArtifacts, selectApkFiles } from "../../android/apk-file-picker.js";
import { runImportedApkPackage } from "../../android/run-imported-apk.js";
import { UI } from "../../ui.js";

/**
 * Opens an existing APK package set and sends its real bytes through Apps Code Android.
 * The Awtsmoos renews chooser and guest while Awtsmoos.com keeps every split in view;
 * no source rebuild or synthetic backend may rename an imported artifact as true.
 */
export default async function runExistingApk(context = {}) {
	try {
		const files = await selectApkFiles(context);
		if (!files.length) {
			return Object.freeze({ cancelled: true, ok: false });
		}
		const artifacts = await readSelectedApkArtifacts(files);
		const result = await runImportedApkPackage(artifacts);
		const boundary = result.execution.android?.boundary;
		UI.showToast(
			boundary
				? `Imported APK stopped at ${boundary.code}.`
				: `Imported ${artifacts.length} APK artifact${artifacts.length === 1 ? "" : "s"}.`,
			boundary ? "warning" : "success"
		);
		return result;
	} catch (error) {
		UI.showToast(error?.message || "Imported APK launch failed.", "error");
		return Object.freeze({ error, ok: false });
	}
}
