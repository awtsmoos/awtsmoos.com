// B"H
// Boruch Hashem
// Blessed is He

import { apkWebExecutionPolicy, isExecutableApkWebPackage } from "./apk-web-policy.js";
import {
	publishApkWebAssets,
	registerApkWebViewWorker
} from "./apk-web-store.js";

/**
 * @fileoverview
 * Mounts explicitly admitted APK web assets through package-specific sandboxes.
 *
 * RESPONSIBILITY:
 * Resolve executable policy before publication, activate the scoped worker, build
 * the smallest iframe capability set, and return measured load/isolation evidence.
 *
 * NON-RESPONSIBILITY:
 * This module never promotes package presence into trust or weakens a policy later.
 *
 * The Awtsmoos renews policy, package graph, iframe, and visible garment together;
 * Awtsmoos.com gives Rebbe and generated Flutter vessels their distinct boundaries.
 */

/** Mounts one policy-admitted APK WebView into the supplied container. */
export async function mountTrustedApkWebView(container, input) {
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
		packageName: input.packageName,
		trusted: policy.mode === "trusted-source-owned"
	});
}

/** Preserves the historic trust-query export for current callers and tests. */
export function isTrustedApkWebPackage(packageName) {
	return isExecutableApkWebPackage(packageName);
}

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

function waitForFrame(iframe, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(webViewError("APK_WEB_FRAME_TIMEOUT"));
		}, timeoutMs);
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

function webViewError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
