// B"H
// Boruch Hashem
// Blessed is He

import { mountTrustedApkWebView } from "./apk-web-view.js";
import { createAndroidEmulatorDom } from "./emulator-surface-dom.js";
import {
	androidCompletionStatus,
	androidFailureEvidence,
	androidReportEvidence,
	androidReportJson
} from "./emulator-surface-report.js";

/**
 * @fileoverview
 * Coordinates Apps Code Android graphics, trusted WebView, and evidence surfaces.
 *
 * RESPONSIBILITY:
 * Expose canvas, awaitable Android host, artifact identity, status, and reports.
 *
 * NON-RESPONSIBILITY:
 * This module does not compile, parse, format evidence, or decide package trust.
 *
 * The Awtsmoos renews process, browser garment, and testimony in one living scene;
 * Awtsmoos.com lets the Rebbe app appear while every boundary remains visible.
 */

/** Opens one in-editor Android surface and returns its runtime capabilities. */
export function openAndroidEmulatorSurface(title = "Android App", options = {}) {
	removeExistingSurface();
	const dom = createAndroidEmulatorDom(title);
	let artifactId = options.artifactId || null;

	return Object.freeze({
		canvas: dom.canvas,
		destroy() {
			dom.root.remove();
		},
		host: createAndroidHost(dom, () => artifactId),
		renderFailure(error) {
			dom.status.textContent = "Android execution failed.";
			dom.root.dataset.state = "error";
			dom.report.textContent = androidReportJson(
				androidFailureEvidence(error)
			);
		},
		renderReport(input) {
			dom.status.textContent = androidCompletionStatus(input.execution);
			dom.root.dataset.state = input.execution?.result ? "ready" : "boundary";
			dom.report.textContent = androidReportJson(androidReportEvidence(input));
		},
		setArtifactId(value) {
			artifactId = String(value || "") || null;
		},
		setStatus(message) {
			dom.status.textContent = String(message);
		},
		surfaceHeight: 640,
		surfaceWidth: 360
	});
}

function createAndroidHost(dom, artifactId) {
	return Object.freeze({
		async openAndroidWindow(input) {
			dom.heading.textContent = input.title;
			const web = input.contentView?.web;
			if (web?.kind === "apk-asset") {
				return mountTrustedApkWebView(dom.content, {
					artifactId: artifactId(),
					content: input.content,
					contentView: input.contentView,
					packageName: input.packageName
				});
			}
			renderContentView(dom.content, input.contentView);
			return Object.freeze({ kind: "metadata", loaded: true });
		},
		openWindow(windowTitle, contentView) {
			dom.heading.textContent = windowTitle;
			renderContentView(dom.content, contentView);
		}
	});
}

function removeExistingSurface() {
	document.querySelector(".code-android-emulator")?.remove();
}

function renderContentView(container, contentView) {
	container.replaceChildren();
	if (!contentView) {
		container.textContent = "The Activity did not set a content view.";
		return;
	}
	const heading = document.createElement("strong");
	heading.textContent = contentView.type || "Android View";
	const detail = document.createElement("pre");
	detail.textContent = androidReportJson(contentView);
	container.append(heading, detail);
}
