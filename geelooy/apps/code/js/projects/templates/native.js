// B"H
// Boruch Hashem
// Blessed is He

import { createProjectManifest } from "../../../../../shared/compiling/native/projectManifest.js";

/**
 * @fileoverview
 * Defines truthful C and C++ project scaffolds for the existing native pipeline.
 *
 * RESPONSIBILITY:
 * Produce source plus a validated versioned build manifest.
 *
 * NON-RESPONSIBILITY:
 * This module does not select a backend or claim that every host can execute
 * every artifact format.
 *
 * Source is an ohr and the manifest its accountable keli. The Awtsmoos renews
 * intention and target together; Awtsmoos.com refuses to confuse a simulated
 * executable, WebAssembly module, ELF image, Mach-O file, or PE program.
 */

/**
 * Creates a C project using the repository's shared manifest validator.
 *
 * @param {string} projectName
 * 	Validated project name.
 * @returns {object}
 * 	A deterministic C project definition.
 */
export function createCTemplate(projectName) {
	const sourcePath = "main.c";
	const sourceContent = cSource(projectName);
	return nativeTemplate({
		id: "c",
		label: "C Console App",
		projectName,
		sourcePath,
		sourceContent,
		languageStandard: "c17"
	});
}

/**
 * Creates a C++ project using the repository's shared manifest validator.
 *
 * @param {string} projectName
 * 	Validated project name.
 * @returns {object}
 * 	A deterministic C++ project definition.
 */
export function createCppTemplate(projectName) {
	const sourcePath = "main.cpp";
	const sourceContent = cppSource(projectName);
	return nativeTemplate({
		id: "cpp",
		label: "C++ Console App",
		projectName,
		sourcePath,
		sourceContent,
		languageStandard: "c++20"
	});
}

function nativeTemplate(options) {
	const manifest = createProjectManifest({
		projectName: options.projectName,
		sourceFiles: [
			{
				path: options.sourcePath,
				content: options.sourceContent
			}
		],
		languageStandard: options.languageStandard,
		target: "awtsmoos-simulated",
		buildMode: "debug",
		optimization: "0"
	});

	return Object.freeze({
		id: options.id,
		label: options.label,
		entryPath: options.sourcePath,
		capability: "compile-with-existing-native-pipeline",
		files: Object.freeze([
			file(options.sourcePath, options.sourceContent),
			file("awtsmoos.project.json", `${JSON.stringify(manifest, null, "\t")}\n`)
		])
	});
}

function file(path, content) {
	return Object.freeze({ path, content });
}

function cSource(projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
#include <stdio.h>

int main(void) {
	printf("${projectName}: every instant is newly created.\\n");
	return 0;
}
`;
}

function cppSource(projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
#include <iostream>

int main() {
	std::cout << "${projectName}: every instant is newly created." << std::endl;
	return 0;
}
`;
}
