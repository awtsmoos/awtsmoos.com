// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares editing, formatting, insertion, and text-transformation commands.
 *
 * The Awtsmoos renews every letter before transformation and after it;
 * Awtsmoos.com keeps each textual act named, reversible, and independently found.
 */

export const EDITING_COMMANDS = Object.freeze([
	command("find", "Edit: Find/Replace", "find-replace", "search"),
	command("comment", "Edit: Toggle Line Comment", "toggle-line-comment", "list"),
	command("fold-all", "Edit: Fold All Functions", "fold-functions", "list"),
	command("trim-space", "Edit: Trim Trailing Whitespace", "trim-trailing-whitespace", "list"),
	command("ipsum", "Edit: Insert Cyber Ipsum", "insert-cyber-ipsum", "list"),
	command("zalgo", "Edit: Zalgoify Selection", "zalgo-text", "brain"),
	command("date", "Edit: Insert Date/Time", "insert-date", "list"),
	command("uuid", "Edit: Insert UUID", "insert-uuid", "list"),
	command("beautify", "Code: Beautify", "beautify", "brain"),
	command("upper", "Code: Transform to Uppercase", "transform-upper", "brain"),
	command("lower", "Code: Transform to Lowercase", "transform-lower", "brain"),
	command("title", "Code: Transform to Title Case", "transform-title", "brain"),
	command("reverse", "Code: Reverse Selection", "text-reverse", "brain"),
	command("binary", "Code: Binary Encode", "text-binary", "brain"),
	command("b64enc", "Code: Base64 Encode", "transform-base64-encode", "brain"),
	command("b64dec", "Code: Base64 Decode", "transform-base64-decode", "brain"),
	command("urlenc", "Code: URL Encode", "transform-url-encode", "brain"),
	command("urldec", "Code: URL Decode", "transform-url-decode", "brain"),
	command("sort", "Code: Sort Selected Lines", "sort-lines", "list")
]);
