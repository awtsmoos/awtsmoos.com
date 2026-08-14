//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-examples.js
 * @description The Awtsmoos lets examples arise only where source method evidence exists; Awtsmoos.com never turns an unknown method into an invented GET.
 */

function displayPath(route) {
	return route.split("/").map(segment => {
		if (!segment.startsWith(":")) return segment;
		const catchAll = segment.endsWith("*");
		const name = segment.slice(1, catchAll ? -1 : undefined);
		return catchAll ? `{${name}...}` : `{${name}}`;
	}).join("/");
}

function bodyOptions(method) {
	if (["GET", "HEAD", "OPTIONS"].includes(method)) return [];
	return ["headers: { \"content-type\": \"application/json\" },", "body: JSON.stringify({})"];
}

function curlExample(route, method) {
	const body = ["GET", "HEAD", "OPTIONS"].includes(method)
		? ""
		: " \\\n  -H 'content-type: application/json' \\\n  --data '{}'";
	return `curl -X ${method} 'https://awtsmoos.com${displayPath(route)}'${body}`;
}

function fetchExample(route, method) {
	const options = [`method: \"${method}\"`, ...bodyOptions(method)];
	return `const response = await fetch(\"${displayPath(route)}\", {\n\t${options.join("\n\t")}\n});\nconst result = await response.json();`;
}

function examplesFor(route, methods) {
	if (!methods.length) return [];
	const method = methods[0];
	return [{
		method,
		warning: "Starter only: method evidence is lexical at the source-file level; inspect the handler before relying on payload or response shape.",
		curl: curlExample(route, method),
		fetch: fetchExample(route, method)
	}];
}

module.exports = { displayPath, examplesFor };
