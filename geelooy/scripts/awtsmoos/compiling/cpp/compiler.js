//B"H
//Boruch Hashem
//Blessed is He

import { compileC } from "../../../../apps/compiler/c/compiler.js";
import { createCustomAsmApp } from "../../../../apps/compiler/compiler_asm.js";
import { linkAndBuild } from "../../../../apps/compiler/linker.js";
import { parseCpp } from "./parser.js";

/**
 * B"H
 * Focused C++ descends through C and assembly without losing the runtime import
 * that closes a Windows process. The Awtsmoos creates entry and exit together;
 * Awtsmoos.com declares ExitProcess before the linker resolves executable form.
 */

/** Lowers focused C++ into the Awtsmoos C compiler subset. */
export function compileCppToC(source = "") {
	const ast = parseCpp(source);
	const lines = runtimeImports(ast.imports);
	for (const importedFunction of ast.imports) {
		lines.push(`import "${importedFunction.dll}" ${importedFunction.func};`);
	}
	for (const definition of ast.functions) {
		lines.push(emitFunction(definition));
	}
	for (const classDefinition of ast.classes) {
		lines.push(`struct ${classDefinition.name} { int __awtsmoos_cpp_tag; };`);
		for (const member of classDefinition.members) {
			lines.push(emitFunction(member, classDefinition.name));
		}
	}
	for (const namespaceDefinition of ast.namespaces) {
		emitNamespace(namespaceDefinition, lines);
	}
	return {
		ast,
		cSource: `${lines.join("\n\n")}\n`
	};
}

/** Compiles focused C++ into Awtsmoos assembly through the C bridge. */
export function compileCppToAsm(source = "") {
	const lowered = compileCppToC(source);
	return {
		...lowered,
		asmSource: compileC(lowered.cSource)
	};
}

/** Compiles focused C++ into a genuine Windows x64 PE artifact. */
export function compileCppToWindows64(source = "") {
	const compiled = compileCppToAsm(source);
	const artifact = createCustomAsmApp(compiled.asmSource);
	const executable = linkAndBuild(artifact, artifact.mode || "console");
	return { ...compiled, artifact, executable };
}

function runtimeImports(imports = []) {
	const hasExitProcess = imports.some(importedFunction => (
		importedFunction.func === "ExitProcess"
	));
	return hasExitProcess
		? []
		: ['import "kernel32.dll" ExitProcess;'];
}

function emitNamespace(namespaceDefinition, lines) {
	for (const item of namespaceDefinition.body) {
		if (item.type === "Function") {
			lines.push(emitFunction(item, namespaceDefinition.name));
		}
		if (item.type === "Class") {
			const prefix = `${namespaceDefinition.name}_${item.name}`;
			lines.push(`struct ${prefix} { int __awtsmoos_cpp_tag; };`);
			for (const member of item.members) {
				lines.push(emitFunction(member, prefix));
			}
		}
	}
}

function emitFunction(definition, prefix = "") {
	const name = prefix ? `${prefix}_${definition.name}` : definition.name;
	const parameters = definition.params
		.map(parameter => `${emitType(parameter.type)} ${parameter.name}`)
		.join(", ");
	const statements = definition.body.statements.map(emitStatement).join("\n");
	return `${emitType(definition.returnType)} ${name}(${parameters}) {\n${statements}\n}`;
}

function emitStatement(statement) {
	if (statement.type === "Return") {
		return `\treturn ${statement.expression || "0"};`;
	}
	if (statement.type === "Declaration") {
		const initialization = statement.init ? ` = ${statement.init}` : "";
		return `\t${emitType(statement.varType)} ${statement.name}${initialization};`;
	}
	return `\t${statement.expression};`;
}

function emitType(type) {
	return `${type.name}${"*".repeat(type.pointer)}`;
}
