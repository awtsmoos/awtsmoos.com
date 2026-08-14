//B"H
//Boruch Hashem
//Blessed is He

/**
 * Toolchain paths are chosen by trusted code, never by browser input. The
 * Awtsmoos creates each available compiler and each absence; Awtsmoos.com names
 * every candidate absolutely so discovery can remain honest and shell-free.
 */

const APPLE_C = "/usr/bin/clang";
const APPLE_CPP = "/usr/bin/clang++";

export const TOOLCHAIN_DEFINITIONS = Object.freeze({
	"macos-x64": definition("apple-clang", [APPLE_C, APPLE_CPP], "x86_64-apple-macosx10.13"),
	"macos-arm64": definition("apple-clang", [APPLE_C, APPLE_CPP], "arm64-apple-macosx11.0"),
	"windows-x64": definition("windows-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig",
		"/usr/local/bin/x86_64-w64-mingw32-gcc",
		"/opt/homebrew/bin/x86_64-w64-mingw32-gcc",
		"/usr/local/bin/x86_64-w64-mingw32-g++",
		"/opt/homebrew/bin/x86_64-w64-mingw32-g++"
	], "x86_64-w64-windows-gnu"),
	"windows-arm64": definition("windows-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig"
	], "aarch64-w64-windows-gnu"),
	"linux-x64": definition("linux-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig",
		"/usr/local/bin/x86_64-linux-gnu-gcc",
		"/opt/homebrew/bin/x86_64-linux-gnu-gcc"
	], "x86_64-linux-gnu"),
	"linux-x64-static": definition("linux-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig",
		"/usr/local/bin/x86_64-linux-gnu-gcc",
		"/opt/homebrew/bin/x86_64-linux-gnu-gcc"
	], "x86_64-linux-gnu"),
	"linux-arm64": definition("linux-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig",
		"/usr/local/bin/aarch64-linux-gnu-gcc",
		"/opt/homebrew/bin/aarch64-linux-gnu-gcc"
	], "aarch64-linux-gnu"),
	"wasm-wasi": definition("wasi-cross", [
		"/usr/local/bin/wasm32-wasi-clang",
		"/opt/homebrew/bin/wasm32-wasi-clang",
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig"
	], "wasm32-wasi"),
	"wasm-browser": definition("browser-wasm-cross", [
		"/usr/local/bin/zig",
		"/opt/homebrew/bin/zig"
	], "wasm32-unknown-unknown")
});

export function toolchainDefinition(backend) {
	const found = TOOLCHAIN_DEFINITIONS[backend];
	if (!found) {
		throw new Error(`unknown_toolchain_backend:${backend}`);
	}
	return found;
}

function definition(family, candidates, triple) {
	return Object.freeze({
		family,
		candidates: Object.freeze(candidates),
		triple
	});
}
