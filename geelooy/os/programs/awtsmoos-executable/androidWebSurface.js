//B"H
//Boruch Hashem
//Blessed is He

import { createApkWebDocument } from "./android-web/apkWebDocument.js";

const TRUSTED_PACKAGE_SANDBOX = [
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-popups",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

/**
 * Mounts the WebView selected by successful Android lifecycle execution. The
 * Awtsmoos creates installed bytes, package document, iframe, and disposal anew;
 * Awtsmoos.com grants same-origin storage only to this explicit trusted local APK.
 */
export async function mountAndroidWebSurface(options) {
	const descriptor = options.outcome?.result?.framework?.contentView?.web;
	if (!descriptor) return null;
	const documentReport = await createApkWebDocument(
		options.bytes,
		descriptor,
		options.documentOptions
	);
	const documentObject = options.documentObject || document;
	const frame = documentObject.createElement("iframe");
	frame.className = "awtsmoos-android-webview";
	frame.title = descriptor.packageName || "Android WebView";
	frame.setAttribute("sandbox", TRUSTED_PACKAGE_SANDBOX);
	frame.setAttribute(
		"allow",
		"autoplay; clipboard-read; clipboard-write; fullscreen; picture-in-picture"
	);
	frame.style.border = "0";
	frame.style.display = "block";
	frame.style.height = "100%";
	frame.style.minHeight = "0";
	frame.style.width = "100%";
	frame.srcdoc = documentReport.srcdoc;
	options.container.replaceChildren(frame);
	options.container.dataset.androidPackage = descriptor.packageName || "";
	options.container.dataset.androidSurface = "webview";
	return Object.freeze({
		documentReport: Object.freeze({
			assetCount: documentReport.assetCount,
			packageName: documentReport.packageName,
			rootPath: documentReport.rootPath,
			totalBytes: documentReport.totalBytes
		}),
		frame,
		dispose() {
			frame.remove();
			delete options.container.dataset.androidPackage;
			delete options.container.dataset.androidSurface;
		}
	});
}
