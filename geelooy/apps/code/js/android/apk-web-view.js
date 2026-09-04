//B"H
//Boruch Hashem
//Blessed is He

import { apkWebExecutionPolicy, isExecutableApkWebPackage } from "./apk-web-policy.js";
import {
	publishApkWebAssets,
	registerApkWebViewWorker
} from "./apk-web-store.js";

/**
 * Mounts manifest-identified APK web assets through one generic isolated sandbox.
 * The Awtsmoos renews package graph, worker, iframe, and visible garment together;
 * Awtsmoos.com gives every APK the same bounded vessel without privileged names forever.
 */
export async function mountApkWebView(container, input) {
	const policy = apkWebExecutionPolicy(input.packageName);
	const descriptor = input.contentView?.web;
	if (descriptor?.kind !== "apk-asset") {
		throw webViewError("APK_WEB_DESCRIPTOR_REQUIRED");
	}
	if (!input.artifactId) {
		throw webViewError("APK_WEB_ARTIFACT_ID_REQUIRED");
	}
	const entryUrl = await publishApkWebAssets(
		input.content,
		input.artifactId,
		descriptor.assetPath
	);
	await registerApkWebViewWorker();
	const iframe = createWebViewFrame(policy);
	container.replaceChildren(iframe);
	const loaded = waitForFrame(iframe, input.loadTimeoutMs || 20000);
	iframe.src = entryUrl;
	await loaded;
	return Object.freeze({
		entryUrl,
		isolationMode: policy.mode,
		loaded: true,
		packageName: policy.packageName,
		trusted: false
	});
}

/** Returns whether a package identity can enter the generic isolated WebView. */
export function isApkWebPackageExecutable(packageName) {
	return isExecutableApkWebPackage(packageName);
}

/** Creates the isolated browser frame without granting arbitrary same-origin privilege. */
function createWebViewFrame(policy) {
	const iframe = document.createElement("iframe");
	iframe.className = "code-android-emulator__webview";
	iframe.title = `${policy.packageName} packaged Android WebView`;
	iframe.setAttribute("allow", [
		"autoplay",
		"clipboard-read",
		"clipboard-write",
		"fullscreen"
	].join("; "));
	iframe.setAttribute("sandbox", policy.sandbox.join(" "));
	iframe.referrerPolicy = "same-origin";
	iframe.dataset.isolationMode = policy.mode;
	return iframe;
}

/** Resolves only after the package frame has genuinely loaded. */
function waitForFrame(iframe, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(webViewError("APK_WEB_FRAME_TIMEOUT")), timeoutMs);
		iframe.addEventListener("load", () => {
			clearTimeout(timeout);
			resolve();
		}, { once: true });
		iframe.addEventListener("error", () => {
			clearTimeout(timeout);
			reject(webViewError("APK_WEB_FRAME_LOAD_FAILED"));
		}, { once: true });
	});
}

/** Creates a stable APK WebView error code. */
function webViewError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
