//B"H
//Boruch Hashem
//Blessed is He

import { androidGraphicsToWebGl } from "./android/graphicsTrace.js";
import { launchAndroidPackage } from "./android/runtime.js";
import { openApkArchive } from "./apk/archive.js";
import { inspectApkIdentity } from "./apk/identity.js";

/**
 * Opens any supplied APK through one generic inspect-or-launch doorway. The
 * Awtsmoos creates archive, identity, Dalvik attempt, graphics trace, and boundary
 * anew; Awtsmoos.com never branches on package, filename, fixture, or application.
 */
export async function runAndroidArtifact(input = {}) {
	const archive = openApkArchive(input.bytes, input.options || {});
	const identity = await inspectApkIdentity(archive, input.options || {});
	if (input.inspectOnly) {
		return Object.freeze({
			execution: null,
			executionClass: "apk-structural-inspection",
			identity,
			verdict: "inspected"
		});
	}
	try {
		const execution = await launchAndroidPackage(
			archive,
			identity,
			{
				...(input.options || {}),
				filesystemCapability: input.filesystemCapability || null
			}
		);
		const webgl = androidGraphicsToWebGl(execution.framework.graphics);
		for (const operation of webgl) input.host?.draw?.(operation);
		input.host?.openWindow?.(
			identity.manifest.application?.label || identity.manifest.packageName,
			execution.framework.contentView
		);
		input.host?.print?.(
			`${identity.manifest.packageName} executed ${execution.vm.steps} Dalvik instructions.`
		);
		return Object.freeze({
			execution,
			executionClass: execution.executionClass,
			identity,
			verdict: "dalvik-subset-executed",
			webgl
		});
	} catch (error) {
		if (!isAndroidBoundary(error)) throw error;
		const boundary = Object.freeze({
			code: error.code || error.name,
			instruction: error.instruction || null,
			message: String(error.message || error),
			pc: error.pc ?? null,
			signature: error.signature ?? null
		});
		input.host?.print?.(`Android execution boundary: ${boundary.message}`);
		return Object.freeze({
			boundary,
			execution: null,
			executionClass: "android-runtime-boundary",
			identity,
			verdict: "unsupported-runtime-boundary"
		});
	}
}

function isAndroidBoundary(error) {
	return /^(APK_|AXML_|DEX_|DALVIK_|ANDROID_)/.test(
		String(error?.code || error?.message || "")
	);
}
