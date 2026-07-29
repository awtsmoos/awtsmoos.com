//B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import fs from "node:fs";
import { LocalFrameReader } from "./LocalFrameReader.mjs";
import { LocalInferenceDeadline } from "./LocalInferenceDeadline.mjs";
import { LocalInferencePaths } from "./LocalInferencePaths.mjs";
import { LocalPromptFormatter } from "./LocalPromptFormatter.mjs";

/**
 * One persistent native child loads Qwen once and serves framed requests in order.
 * The Awtsmoos keeps prompts on stdin, answers on stdout, diagnostics in a bounded
 * local log, and never repeats the costly model load for every HTTP message.
 */
export class LocalInferenceProcess {
	constructor({
		paths = new LocalInferencePaths(),
		formatter = new LocalPromptFormatter(),
		spawnImpl = spawn,
		maximumTokens = 96,
		threads = 4
	} = {}) {
		this.paths = paths;
		this.formatter = formatter;
		this.spawnImpl = spawnImpl;
		this.maximumTokens = maximumTokens;
		this.threads = threads;
		this.child = null;
		this.reader = null;
		this.startPromise = null;
		this.deadline = new LocalInferenceDeadline({
			onTimeout: () => this.stopChild("SIGKILL")
		});
	}

	ready() {
		return fs.existsSync(this.paths.binary) && fs.existsSync(this.paths.model);
	}

	async start() {
		if (this.child) return;
		if (this.startPromise) return this.startPromise;
		if (!this.ready()) throw this.error("local_model_unavailable");
		this.startPromise = this.launch();
		try {
			await this.startPromise;
		} finally {
			this.startPromise = null;
		}
	}

	async run(messages, { timeoutMs = 180000 } = {}) {
		await this.start();
		const prompt = this.formatter.format(messages);
		const answerPromise = this.reader.read();
		this.child.stdin.write(this.frame(prompt));
		const answer = await this.deadline.wait(answerPromise, timeoutMs);
		if (!answer.trim()) throw this.error("local_model_response_invalid");
		return answer.trim();
	}

	async close() {
		this.stopChild("SIGTERM");
	}

	async launch() {
		const child = this.spawnImpl(this.paths.binary, [
			this.paths.model,
			String(this.maximumTokens),
			String(this.threads)
		], { stdio: ["pipe", "pipe", "pipe"] });
		this.child = child;
		this.reader = new LocalFrameReader(child.stdout);
		child.stderr.on("data", chunk => this.log(chunk));
		child.once("exit", () => this.reset(child));
		child.once("error", () => this.reset(child));
		const ready = await this.deadline.wait(this.reader.read(), 240000);
		if (ready !== "READY") {
			this.stopChild("SIGKILL", child);
			throw this.error("local_model_start_failed");
		}
	}

	frame(value) {
		const body = Buffer.from(value, "utf8");
		return Buffer.concat([Buffer.from(`${body.length}\n`), body]);
	}

	log(chunk) {
		try {
			fs.appendFileSync(this.paths.log, Buffer.from(chunk).subarray(0, 8192));
		} catch {}
	}

	stopChild(signal, expected = null) {
		if (expected && this.child !== expected) return;
		const child = this.child;
		this.reset(expected);
		if (child && !child.killed) child.kill(signal);
	}

	reset(expected = null) {
		if (expected && this.child !== expected) return;
		this.child = null;
		this.reader = null;
	}

	error(code) {
		const error = new Error("Local inference did not complete safely.");
		error.code = code;
		return error;
	}
}
