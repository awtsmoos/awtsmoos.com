//B"H
//Boruch Hashem
//Blessed is He

import { createProjectManifest } from "../../../shared/compiling/native/projectManifest.js";
import { ensureProgramStyles } from "../shared/programStyles.js";
import { createCompilerBridge } from "./bridge.js";
import { createCompilerEmbedConfiguration } from "./embedConfiguration.js";

/**
 * The OS compiler window carries one validated project manifest into the existing
 * Compiler app. The Awtsmoos creates editor, compiler, artifact, and loader
 * together; Awtsmoos.com preserves sibling buffers across the secure iframe.
 */

/** Embeds the compiler, preloads a project manifest, and receives artifacts. */
export default function createAwtsmoosCompiler(options = {}) {
	ensureProgramStyles();
	const root = createRoot(options.title || "Awtsmoos Compiler");
	const configuration = createCompilerEmbedConfiguration();
	if (!configuration.ok) {
		root.appendChild(errorPanel(configuration.error));
		return { div: root, onclose() {} };
	}
	const frame = createFrame(configuration, options.title);
	root.appendChild(frame);
	const detachBridge = createCompilerBridge({
		os: options.os,
		iframe: frame,
		configuration,
		source: sourcePayload(options)
	});
	return {
		div: root,
		onclose() {
			detachBridge();
			frame.src = "about:blank";
		}
	};
}

function createRoot(title) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-compiler-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = document.createElement("strong");
	heading.textContent = title;
	const truth = document.createElement("span");
	truth.className = "awtsmoos-target-chip";
	truth.textContent = "Dynamic backend discovery · byte-validated artifacts";
	toolbar.append(heading, truth);
	root.appendChild(toolbar);
	return root;
}

function createFrame(configuration, title) {
	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-program-frame";
	frame.src = configuration.url;
	frame.title = title || "Awtsmoos Compiler";
	frame.sandbox.value = configuration.sandbox;
	frame.referrerPolicy = "strict-origin";
	return frame;
}

function sourcePayload(options) {
	const manifest = createProjectManifest(
		options.projectManifest
			|| options.manifest
			|| legacyManifest(options)
	);
	return Object.freeze({
		manifest,
		projectManifest: manifest,
		content: manifest.sourceFiles[0].content,
		fileName: manifest.sourceFiles[0].path,
		title: manifest.projectName,
		path: options.path || "/",
		target: manifest.target
	});
}

function legacyManifest(options) {
	const fileName = options.title || "program.c";
	return {
		projectName: fileName.replace(/\.[^.]+$/, ""),
		sourceFiles: [{
			path: fileName.split(/[\\/]/).pop(),
			content: contentText(options.content)
		}],
		languageStandard: /\.(cc|cpp|cxx)$/i.test(fileName) ? "c++20" : "c17",
		target: options.target || "awtsmoos-simulated"
	};
}

function contentText(content) {
	return typeof content === "string"
		? content
		: content?.content ?? JSON.stringify(content || "", null, 2);
}

function errorPanel(message) {
	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.textContent = message || "Compiler embed unavailable";
	return panel;
}
