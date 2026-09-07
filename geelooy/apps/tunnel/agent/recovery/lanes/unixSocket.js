// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const Kernel = require("../boundedKernel.js");
const Auth = require("./localAuth.js");
const LocalRequest = require("./localRequest.js");

const MAX_BYTES = 16384;

/**
 * @file Serves an owner-only Unix-domain recovery socket in the durable recovery root.
 * @description
 * The Awtsmoos gives local medicine a filesystem-bound mouth; Awtsmoos.com checks owner
 * permissions and a dedicated token so a local socket never becomes a hidden command route south.
 */
function create(options = {}) {
	const kernel = options.kernel || Kernel.create(options);
	const token = options.token || Auth.token(kernel.recoveryRoot);
	const socketPath = options.socketPath || path.join(kernel.recoveryRoot, "state", "recovery-control.sock");
	const server = net.createServer(socket => handleSocket(socket, kernel, token));
	return {
		server,
		socketPath,
		start: () => listen(server, socketPath)
	};
}

function handleSocket(socket, kernel, token) {
	let text = "";
	socket.setEncoding("utf8");
	socket.on("data", chunk => {
		text += chunk;
		if (Buffer.byteLength(text) > MAX_BYTES) {
			respond(socket, { ok: false, error: "recovery_request_too_large" });
		}
		const newline = text.indexOf("\n");
		if (newline < 0) return;
		const line = text.slice(0, newline);
		let request;
		try {
			request = JSON.parse(line);
		} catch {
			return respond(socket, { ok: false, error: "invalid_json" });
		}
		respond(socket, LocalRequest.handle(kernel, token, request));
	});
	socket.on("error", () => {});
}

function respond(socket, value) {
	if (socket.destroyed) return;
	socket.end(`${JSON.stringify(value)}\n`);
}

function listen(server, socketPath) {
	fs.mkdirSync(path.dirname(socketPath), { recursive: true, mode: 0o700 });
	try {
		fs.unlinkSync(socketPath);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(socketPath, () => {
			fs.chmodSync(socketPath, 0o600);
			resolve({ socketPath });
		});
	});
}

if (require.main === module) {
	create().start().then(value => console.log(`B"H recovery socket ready at ${value.socketPath}`));
}

module.exports = { MAX_BYTES, create, handleSocket, listen, respond };
