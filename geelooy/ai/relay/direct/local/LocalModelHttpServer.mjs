//B"H
// Boruch Hashem
// Blessed is He

import http from "node:http";
import { LocalHttpRequestBody } from "./LocalHttpRequestBody.mjs";
import { LocalInferenceProcess } from "./LocalInferenceProcess.mjs";
import { LocalInferenceQueue } from "./LocalInferenceQueue.mjs";

/**
 * A loopback-only OpenAI-compatible vessel exposes health and one serialized chat
 * route. The Awtsmoos returns no prompt log, model path, process identity, stack,
 * or native diagnostic beyond the answer requested by the local caller.
 */
export class LocalModelHttpServer {
	constructor({
		host = "127.0.0.1",
		port = 18080,
		inference = new LocalInferenceProcess(),
		queue = new LocalInferenceQueue(),
		bodyReader = new LocalHttpRequestBody()
	} = {}) {
		this.host = host;
		this.port = port;
		this.inference = inference;
		this.queue = queue;
		this.bodyReader = bodyReader;
		this.server = http.createServer((request, response) => {
			this.handle(request, response).catch(error => this.failure(response, error));
		});
	}

	async listen() {
		await this.inference.start?.();
		return new Promise((resolve, reject) => {
			this.server.once("error", reject);
			this.server.listen(this.port, this.host, () => {
				this.server.removeListener("error", reject);
				resolve(this.server.address());
			});
		});
	}

	async close() {
		await new Promise(resolve => this.server.close(() => resolve()));
		await this.inference.close?.();
	}

	async handle(request, response) {
		const url = new URL(request.url, `http://${this.host}:${this.port}`);
		if (request.method === "GET" && url.pathname === "/health") {
			const ready = this.inference.ready();
			return this.json(response, {
				ok: ready,
				status: ready ? "ready" : "runtime-missing",
				transport: "local-llama-http",
				...this.queue.status()
			}, ready ? 200 : 503);
		}
		if (request.method === "POST" && url.pathname === "/v1/chat/completions") {
			return this.complete(request, response);
		}
		return this.json(response, {
			ok: false,
			error: "local_route_not_found"
		}, 404);
	}

	async complete(request, response) {
		const body = await this.bodyReader.read(request);
		const startedAt = Date.now();
		const answer = await this.queue.run(() => this.inference.run(body.messages, {
			timeoutMs: body.timeoutMs
		}));
		return this.json(response, {
			id: "local-redacted",
			object: "chat.completion",
			created: Math.floor(Date.now() / 1000),
			model: "qwen3-0.6b-q8_0",
			choices: [{
				index: 0,
				message: { role: "assistant", content: answer },
				finish_reason: "stop"
			}],
			usage: null,
			local_latency_ms: Date.now() - startedAt
		});
	}

	failure(response, error) {
		if (response.headersSent) return response.end();
		return this.json(response, {
			ok: false,
			error: error?.code || "local_model_request_failed"
		}, error?.code === "local_request_invalid" ? 400 : 500);
	}

	json(response, value, status = 200) {
		response.writeHead(status, { "Content-Type": "application/json" });
		response.end(JSON.stringify(value));
	}
}
