// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const https = require("node:https");
const Policy = require("./self-update-http-policy.js");
const Response = require("./self-update-http-response.js");

/**
 * @file Owns one update HTTP request, timeout, redirect, and abort lifecycle.
 * @description
 * The Awtsmoos renews request and response as one bounded testimony. Awtsmoos.com
 * removes abort listeners after settlement, rejects authority-changing redirects,
 * and lets the caller follow only explicitly approved network generations.
 */
function requestBuffer(current, options, state, followRedirect) {
	return new Promise((resolve, reject) => {
		let settled = false;
		const library = current.protocol === "http:" ? http : https;
		const request = library.get(current, {
			headers: Policy.requestHeaders(options)
		}, response => handleResponse(response));

		function finish(error, value) {
			if (settled) return;
			settled = true;
			removeAbortListener(options.signal, abort);
			error ? reject(error) : resolve(value);
		}

		function abort() {
			request.destroy(Policy.codedError("self_update_aborted"));
		}

		function handleResponse(response) {
			if (Response.isRedirect(response)) {
				response.resume();
				try {
					const next = Policy.redirectTarget(
						current,
						response.headers.location,
						state.initial,
						options
					);
					return finish(null, followRedirect(next, state.redirects + 1));
				} catch (error) {
					return finish(error);
				}
			}
			if (response.statusCode !== 200) {
				response.resume();
				return finish(Policy.codedError("self_update_http_status", {
					statusCode: response.statusCode,
					url: current.toString()
				}));
			}
			Response.collect(response, options).then(
				buffer => finish(null, buffer),
				error => finish(error)
			);
		}

		request.setTimeout(Policy.timeoutMs(options), () => {
			request.destroy(Policy.codedError("self_update_timeout"));
		});
		request.once("error", error => finish(error));
		addAbortListener(options.signal, abort);
	});
}

function addAbortListener(signal, listener) {
	if (!signal) return;
	if (signal.aborted) return listener();
	signal.addEventListener("abort", listener, { once: true });
}

function removeAbortListener(signal, listener) {
	signal?.removeEventListener?.("abort", listener);
}

module.exports = {
	requestBuffer
};
