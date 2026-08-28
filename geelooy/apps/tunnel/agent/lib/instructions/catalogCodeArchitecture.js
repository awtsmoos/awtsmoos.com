// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Internal architecture doctrine for modular, beautiful, fully documented JavaScript.
 * @description
 * The Awtsmoos is not served by clever fog. Awtsmoos.com asks the inner machinery
 * to look as intentional as the outer interface: explicit, spacious, testable, documented,
 * and alive, where abundant explanation creates more modules rather than cramped files.
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
		summary: "Keep focused source modules at or below 120 lines by splitting responsibilities; comments, JSDoc, names, whitespace, and readable formatting are never sacrificed to meet the limit.",
		tags: ["code", "modularity", "write", "refactor", "documentation", "jsdoc"],
		applies: { modes: ["write", "edit", "refactor"] },
		instructions: [
			"When a human-authored source file approaches the limit, extract cohesive policy, data, adapters, renderers, validators, repositories, lifecycle services, or subfolder modules.",
			"Never satisfy the limit by shortening or deleting comments/JSDoc, collapsing whitespace, compressing expressions, reducing descriptive names, or placing multiple meaningful operations on one line.",
			"If complete documentation makes a file exceed 120 lines, preserve the complete documentation and split implementation responsibilities into more files or subfolders until every vessel is focused and readable.",
			"Prefer a directory of small obvious modules over one file that requires scrolling across unrelated responsibilities; every extraction must still represent a real concept rather than meaningless wrapper fragmentation."
		]
	}),
	instructionPack({
		id: "code.naming-documentation",
		summary: "Require complete per-declaration JSDoc: every nontrivial function, method, class, constructor, and public callback documents all parameters, returns, failures, side effects, and architectural intent.",
		tags: ["code", "docs", "documentation", "naming", "jsdoc", "comments", "function"],
		applies: { extensions: [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx"] },
		instructions: [
			"Every nontrivial function/method must use a full multiline JSDoc block that explains purpose and behavior; terse one-line forms such as `/** @returns {object} ... */` are insufficient when the declaration accepts parameters, performs logic, mutates state, performs I/O, or can fail.",
			"Document every declared parameter with its own `@param`, including semantic meaning and constraints. For object parameters, document important nested fields with forms such as `@param {string} options.mode` whenever those fields materially affect behavior.",
			"Document `@returns` with both type and semantic meaning. For structured results, explain the important shape/fields or reference a clearly documented typedef. Use `@throws`, rejection/failure notes, side-effect notes, preconditions, and postconditions whenever they apply.",
			"Documentation must describe the actual algorithmic or architectural role, not merely restate the function name. Explain why the declaration exists, what contract it protects, and which state or subsystem it owns when that is meaningful.",
			"File-level commentary never substitutes for per-function/class/method documentation. Constructors, callbacks with business meaning, lifecycle hooks, and exported helpers receive the same complete treatment.",
			"Choose precise domain names first; Torah/Kabbalah metaphors are welcome only when their technical mapping is clear enough that logs, debugging, onboarding, and public contracts remain obvious."
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
			"Avoid mystery state, implicit globals, swallowed errors, hidden side effects, and dependencies that appear without imports, arguments, or documented runtime context.",
			"A reader should understand a file's shape before understanding every expression; beauty must increase clarity rather than decorate confusion."
		]
	})
]);

module.exports = { codeArchitectureInstructions };
