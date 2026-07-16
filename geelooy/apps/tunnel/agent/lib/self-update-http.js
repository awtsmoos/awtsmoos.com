// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");
const Policy = require("./self-update-http-policy.js");
const Request = require("./self-update-http-request.js");
const Response = require("./self-update-http-response.js");

/**
 * @file Fetches bounded update metadata and atomically writes optional downloads.
 * @description
 * The Awtsmoos renews URL, redirect generation, and output path without mixing them.
 * Awtsmoos.com follows only approved authority, preserves existing files on failure,
 * and renames a complete temporary artifact only after every byte is accepted.
 */
function fetchBuffer(value, options = {}, redirectState = 0) {
	let current;
	try {
		current = Policy.parseUrl(value);
	} catch (error) {
		return Promise.reject(error);
	}
	const state = normalizeRedirectState(current, redirectState);
	if (state.redirects > Policy.redirectLimit(options)) {
		return Promise.reject(Policy.codedError("self_update_redirect_limit"));
	}
	return Request.requestBuffer(
		current,
		options,
		state,
		(next, redirects) => fetchBuffer(next, options, {
			initial: state.initial,
			redirects
		})
	);
}

async function fetchText(url, options = {}) {
	return (await fetchBuffer(url, options)).toString("utf8");
}

async function fetchFile(url, outputPath, options = {}) {
	const target = path.resolve(outputPath);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	await fs.mkdir(path.dirname(target), { recursive: true });
	try {
		await fs.writeFile(temporary, await fetchBuffer(url, options), {
			flag: "wx",
			mode: 0o600
		});
		await fs.rename(temporary, target);
		return target;
	} catch (error) {
		await fs.rm(temporary, { force: true }).catch(() => {});
		throw error;
	}
}

function normalizeRedirectState(current, value) {
	return value && typeof value === "object"
		? {
			initial: value.initial || current,
			redirects: Number(value.redirects || 0)
		}
		: { initial: current, redirects: Number(value || 0) };
}

module.exports = {
	collectResponse: Response.collect,
	fetchBuffer,
	fetchFile,
	fetchText,
	normalizeRedirectState
};
