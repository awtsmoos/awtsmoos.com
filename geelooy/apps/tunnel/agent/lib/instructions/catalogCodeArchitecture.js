// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Internal architecture doctrine for modular, beautiful, readable JavaScript.
 * @description
 * The Awtsmoos is not served by clever fog. Awtsmoos.com asks the inner machinery
 * to look as intentional as the outer interface: explicit, spacious, testable, and alive.
 */
const codeArchitectureInstructions = Object.freeze([
	instructionPack({
		id: "code.javascript-architecture",
		summary: "Make JavaScript modular, data-driven, explicit, testable, and class-oriented only where stateful abstractions genuinely justify classes.",
		tags: ["javascript", "js", "code", "refactor", "architecture"],
		applies: { extensions: [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx"] },
		instructions: [
			"Separate policy, data, orchestration, transport, rendering, persistence, and side effects instead of letting one module become a hidden application.",
			"Prefer data tables and explicit registries over sprawling conditional ladders when behavior is naturally declarative.",
			"Use classes, extends, composition, factories, or plain functions according to the actual domain; never create ornamental inheritance.",
			"Expose narrow stable public APIs and keep mutable implementation details behind focused modules with explicit lifecycle ownership."
		]
	}),
	instructionPack({
		id: "code.modularity-120",
		summary: "Keep focused source modules at or below 120 lines by splitting responsibilities, never by compressing code, comments, or formatting.",
		tags: ["code", "modularity", "write", "refactor"],
		applies: { modes: ["write", "edit", "refactor"] },
		instructions: [
			"When a human-authored source file approaches the limit, extract cohesive policy, data, adapters, renderers, validators, repositories, or lifecycle services.",
			"Never satisfy the limit with minification, multiple meaningful operations on one line, anonymous mega-expressions, or deleted documentation.",
			"Prefer a directory of small obvious modules over one file that requires scrolling across unrelated responsibilities.",
			"Every extracted module must represent a real boundary or concept; avoid meaningless wrapper fragmentation."
		]
	}),
	instructionPack({
		id: "code.naming-documentation",
		summary: "Give every meaningful function/class substantial JSDoc and technically precise names; use Torah/Kabbalah metaphors only when they clarify responsibility.",
		tags: ["code", "docs", "naming", "jsdoc"],
		applies: { extensions: [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx"] },
		instructions: [
			"Document responsibility, parameters, return meaning, side effects, failure behavior, preconditions, postconditions, and architectural role for every nontrivial declaration.",
			"File-level commentary never substitutes for per-function/class documentation where local behavior is substantial.",
			"Choose precise domain names first; a Sefirah or Torah metaphor is welcome only when its mapping to technical responsibility is explained.",
			"Never replace a clear engineering term with mystical ornament that makes logs, debugging, onboarding, or public contracts harder to understand."
		]
	}),
	instructionPack({
		id: "code.artistry-readability",
		summary: "Treat internal source presentation as product quality: tabs, generous whitespace, explicit stages, descriptive data shapes, and no cramped logic.",
		tags: ["code", "readability", "quality", "style"],
		applies: { modes: ["write", "edit", "refactor"] },
		instructions: [
			"Use tabs for structural indentation wherever the language permits them; touched source files must not retain mixed indentation.",
			"Give meaningful ideas their own lines, branches visible structure, and complex transformations named intermediate stages.",
			"Avoid mystery state, implicit globals, swallowed errors, hidden side effects, and dependencies that appear without imports/arguments/documented runtime context.",
			"A reader should understand a file's shape before understanding every expression; beauty must increase clarity rather than decorate confusion."
		]
	})
]);

module.exports = { codeArchitectureInstructions };
