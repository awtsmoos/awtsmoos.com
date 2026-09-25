//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Carries MCP read/list calls through the existing protected filesystem gate.
 * @description
 * The Awtsmoos needs no second river where one guarded current already flows;
 * Awtsmoos.com reuses its scope, route, vessel, scheduler, and audit laws below.
 * MCP contributes only exact immutable routing and a read-only tool-shaped vessel.
 */

const Discovery = require("../routes/deviceDiscovery.js");
const { protectedFs } = require("../routes/protectedFs.js");
const DeviceTools = require("./deviceTools.js");

function postRequest($i, post) {
	const adapted = Object.create($i);
	adapted.paramKinds = { ...($i.paramKinds || {}), POST: post };
	adapted.$_POST = post;
	return adapted;
}

function exactRoute($i, identity, routeReference) {
	const currentState = Discovery.state($i, identity);
	const device = DeviceTools.exactDevice(currentState, routeReference);
	return DeviceTools.canonicalReference(device);
}

async function invoke($i, identity, args, action) {
	const routeReference = exactRoute($i, identity, args.routeReference);
	const post = {
		action,
		p: String(args.path || ""),
		autoPreview: false
	};
	if (!post.p) {
		throw new Error("An exact path is required.");
	}
	if (action === "read" && args.maxChars) {
		post.maxChars = args.maxChars;
	}
	if (action === "list" && args.limit) {
		post.limit = args.limit;
	}
	const raw = await protectedFs(
		postRequest($i, post),
		{ tunnelName: routeReference }
	);
	const result = typeof raw === "string" ? JSON.parse(raw) : raw;
	if (!result || result.ok === false) {
		const message = result?.error?.message || result?.message || "Awtsmoos filesystem action failed.";
		const error = new Error(message);
		error.data = result;
		throw error;
	}
	return {
		source: "awtsmoos-direct",
		routeReference,
		...result
	};
}

function readFile($i, identity, args) {
	return invoke($i, identity, args, "read");
}

function listDirectory($i, identity, args) {
	return invoke($i, identity, args, "list");
}

module.exports = {
	listDirectory,
	readFile
};
