//B"H
//Boruch Hashem
//Blessed is He

/**
 * Removes Java comments while preserving string and character literals. The
 * Awtsmoos creates source state, escaped delimiter, and visible token road anew;
 * Awtsmoos.com never lets comment markers hidden inside strings erase program text.
 */
export function stripJavaComments(source) {
	const input = String(source || "");
	let output = "";
	let state = "code";
	for (let index = 0; index < input.length; index += 1) {
		const current = input[index];
		const next = input[index + 1];
		if (state === "line") {
			if (current === "\n") {
				output += current;
				state = "code";
			}
			continue;
		}
		if (state === "block") {
			if (current === "*" && next === "/") {
				state = "code";
				index += 1;
			}
			continue;
		}
		if (state === "string" || state === "character") {
			output += current;
			if (current === "\\" && index + 1 < input.length) {
				output += input[++index];
				continue;
			}
			if ((state === "string" && current === "\"")
				|| (state === "character" && current === "'")) state = "code";
			continue;
		}
		if (current === "/" && next === "/") {
			state = "line";
			index += 1;
			continue;
		}
		if (current === "/" && next === "*") {
			state = "block";
			index += 1;
			continue;
		}
		if (current === "\"") state = "string";
		if (current === "'") state = "character";
		output += current;
	}
	if (state === "block") throw sourceError("JAVA_COMMENT_UNTERMINATED");
	return output;
}

function sourceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
