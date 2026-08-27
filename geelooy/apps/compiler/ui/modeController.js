//B"H
//Boruch Hashem
//Blessed is He

import { examplesForMode } from "./sourceExamples.js";

/**
 * A language mode is one garment within a preserved project manifest. The
 * Awtsmoos creates visible source and hidden sibling buffers together;
 * Awtsmoos.com updates the active vessel without discarding the wider project.
 */

/** Coordinates language mode, examples, and OS-provided project source. */
export function createModeController(elements) {
	let inboundManifest = null;

	function bind() {
		for (const radio of elements.radios) {
			radio.addEventListener("change", () => refresh(true));
		}
		elements.exampleSelect.addEventListener("change", loadExample);
		refresh(true);
	}

	function currentMode() {
		return elements.radios.find(radio => radio.checked)?.value || "c";
	}

	function currentSource() {
		return sourceMode(currentMode())
			? elements.sourceEditor.value
			: elements.userText.value || "Hello World from Awtsmoos!";
	}

	function currentName() {
		return elements.sourceEditor.dataset.fileName
			|| inboundManifest?.sourceFiles?.[0]?.path
			|| `${currentMode()}_app`;
	}

	function currentManifest() {
		return inboundManifest;
	}

	function openSource(payload = {}) {
		inboundManifest = payload.manifest || payload.projectManifest || null;
		const source = inboundManifest?.sourceFiles?.[0] || payload;
		const fileName = source.path || payload.fileName || payload.title || "program.c";
		selectMode(cppExtension(fileName) ? "cpp" : "c");
		elements.sourceEditor.value = String(source.content ?? payload.content ?? "");
		elements.sourceEditor.dataset.fileName = fileName;
		refresh(false);
		return inboundManifest;
	}

	function refresh(loadDefault) {
		const mode = currentMode();
		const usesSource = sourceMode(mode);
		elements.standardGroup.classList.toggle("hidden", usesSource);
		elements.sourceGroup.classList.toggle("hidden", !usesSource);
		elements.sourceLabel.textContent = labelFor(mode);
		populateExamples(mode);
		if (usesSource && loadDefault && !elements.sourceEditor.value.trim()) {
			elements.sourceEditor.value = examplesForMode(mode)[0]?.source || "";
		}
	}

	function populateExamples(mode) {
		elements.exampleSelect.replaceChildren();
		for (const example of examplesForMode(mode)) {
			const option = document.createElement("option");
			option.value = example.key;
			option.textContent = example.label;
			elements.exampleSelect.appendChild(option);
		}
	}

	function loadExample() {
		const example = examplesForMode(currentMode()).find(item => (
			item.key === elements.exampleSelect.value
		));
		if (example) {
			elements.sourceEditor.value = example.source;
		}
	}

	function selectMode(mode) {
		for (const radio of elements.radios) {
			radio.checked = radio.value === mode;
		}
	}

	return {
		bind,
		currentMode,
		currentSource,
		currentName,
		currentManifest,
		openSource
	};
}

function sourceMode(mode) {
	return ["asm", "c", "cpp"].includes(mode);
}

function labelFor(mode) {
	return mode === "asm"
		? "Assembly source"
		: mode === "cpp"
			? "C++ project source"
			: "C project source";
}

function cppExtension(value = "") {
	return /\.(cc|cpp|cxx|hh|hpp|hxx)$/i.test(String(value));
}
