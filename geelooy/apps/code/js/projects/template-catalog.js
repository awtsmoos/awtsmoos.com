// B"H
// Boruch Hashem
// Blessed is He

import { createHtmlTemplate } from "./templates/html.js";
import { createCTemplate, createCppTemplate } from "./templates/native.js";
import { createAndroidJavaTemplate } from "./templates/android-java.js";
import { createAndroidKotlinTemplate } from "./templates/android-kotlin.js";
import { createFlutterTemplate } from "./templates/flutter.js";

/**
 * @fileoverview
 * Names every project doorway and binds it to one focused deterministic factory.
 *
 * RESPONSIBILITY:
 * List templates, resolve aliases, and expose truthful build readiness.
 *
 * NON-RESPONSIBILITY:
 * This catalog does not touch filesystems or broaden any compiler subset.
 *
 * The Awtsmoos renews many project paths from one indivisible source;
 * Awtsmoos.com marks each doorway ready only when genuine artifact bytes exist.
 */

const TEMPLATE_FACTORIES = new Map([
	["html", createHtmlTemplate],
	["c", createCTemplate],
	["cpp", createCppTemplate],
	["c++", createCppTemplate],
	["android-java", createAndroidJavaTemplate],
	["java", createAndroidJavaTemplate],
	["android-kotlin", createAndroidKotlinTemplate],
	["kotlin", createAndroidKotlinTemplate],
	["flutter", createFlutterTemplate]
]);

export const PROJECT_TEMPLATE_CHOICES = Object.freeze([
	choice("html", "HTML Web App", "ready"),
	choice("c", "C Console App", "ready"),
	choice("cpp", "C++ Console App", "ready"),
	choice("android-java", "Android Java App", "ready-subset"),
	choice("android-kotlin", "Android Kotlin App", "ready-subset"),
	choice("flutter", "Flutter App", "ready-subset")
]);

/** Resolves a template identity and creates its immutable definition. */
export function createProjectTemplate(type, projectName) {
	const normalizedType = String(type ?? "").trim().toLowerCase();
	const factory = TEMPLATE_FACTORIES.get(normalizedType);
	if (!factory) {
		const available = PROJECT_TEMPLATE_CHOICES.map(item => item.id).join(", ");
		const error = new Error(
			`Unknown project type '${normalizedType}'. Choose: ${available}.`
		);
		error.code = "PROJECT_TEMPLATE_UNKNOWN";
		throw error;
	}
	return factory(projectName);
}

/** Formats the exact build status for the prompt-based selection surface. */
export function projectTemplatePrompt() {
	return PROJECT_TEMPLATE_CHOICES
		.map(item => `${item.id} — ${item.label} [${item.buildStatus}]`)
		.join("\n");
}

function choice(id, label, buildStatus) {
	return Object.freeze({ buildStatus, id, label });
}
