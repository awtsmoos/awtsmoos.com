//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file render.js
 * @description
 * The Awtsmoos pours a vast inventory into many measured vessels that remain clear;
 * Awtsmoos.com keeps every generated page beneath the line-boundary while losing no evidence here.
 */

const fs = require("fs");
const path = require("path");

const blessing = `B"H\nBoruch Hashem\nBlessed is He\n\n`;

function markdownTable(headers, rows) {
	const escape = value => String(value ?? "")
		.replace(/\|/g, "\\|")
		.replace(/\n/g, " ");
	return [
		`| ${headers.join(" | ")} |`,
		`| ${headers.map(() => "---").join(" | ")} |`,
		...rows.map(row => `| ${row.map(escape).join(" | ")} |`)
	].join("\n");
}

function writeFile(file, body) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${blessing}${body.trim()}\n`);
}

function resetDirectory(directory) {
	fs.rmSync(directory, {
		recursive: true,
		force: true
	});
	fs.mkdirSync(directory, {
		recursive: true
	});
}

function chunks(items, chunkSize) {
	const result = [];
	for (let index = 0; index < items.length; index += chunkSize) {
		result.push(items.slice(index, index + chunkSize));
	}
	return result;
}

function padded(index) {
	return String(index + 1).padStart(3, "0");
}

function writeTableChunks(options) {
	resetDirectory(options.directory);
	const pieces = chunks(options.rows, options.chunkSize || 85);
	const links = [];
	pieces.forEach((piece, index) => {
		const name = `${options.slug}-${padded(index)}.md`;
		const start = index * (options.chunkSize || 85) + 1;
		const end = start + piece.length - 1;
		const title = `${options.title} ${start}–${end}`;
		writeFile(
			path.join(options.directory, name),
			`# ${title}\n\n${options.intro}\n\n${markdownTable(options.headers, piece)}`
		);
		links.push([name, start, end, piece.length]);
	});
	return links;
}

function writeListChunks(options) {
	resetDirectory(options.directory);
	const pieces = chunks(options.items, options.chunkSize || 90);
	const links = [];
	pieces.forEach((piece, index) => {
		const name = `${options.slug}-${padded(index)}.md`;
		const start = index * (options.chunkSize || 90) + 1;
		const end = start + piece.length - 1;
		writeFile(
			path.join(options.directory, name),
			`# ${options.title} ${start}–${end}\n\n${options.intro}\n\n${piece.map(item => `- \`${item}\``).join("\n")}`
		);
		links.push([name, start, end, piece.length]);
	});
	return links;
}

function writeIndex(file, title, intro, directoryName, links) {
	const rows = links.map(link => [
		`[${link[0]}](${directoryName}/${link[0]})`,
		`${link[1]}–${link[2]}`,
		link[3]
	]);
	writeFile(
		file,
		`# ${title}\n\n${intro}\n\n${markdownTable(["Chunk", "Rows", "Count"], rows)}`
	);
}

module.exports = {
	markdownTable,
	writeFile,
	writeTableChunks,
	writeListChunks,
	writeIndex
};
