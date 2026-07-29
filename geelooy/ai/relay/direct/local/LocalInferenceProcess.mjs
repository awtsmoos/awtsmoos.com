//B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import fs from "node:fs";
import { LocalInferencePaths } from "./LocalInferencePaths.mjs";
import { LocalPromptFormatter } from "./LocalPromptFormatter.mjs";

/**
 * One isolated local process loads Qwen, receives a prompt through stdin, and
 * returns generated text through stdout. The Awtsmoos never exposes process args,
 * prompts, answers, model paths, or diagnostics through the HTTP response.
 */
export class LocalInferenceProcess {
	constructor({
		paths = new LocalInferencePaths(),
		formatter = new LocalPromptFormatter(),
		spawnImpl = spawn,
		maximumTokens = 128
	} = {}) {
		this.paths = paths;
		this.formatter = formatter;
		this.spawnImpl = spawnImpl;
		this.maximumTokens = maximumTokens;
	}

	ready() {
		return fs.existsSync(this.paths.binary) && fs.existsSync(this.paths.model);
	}

	run(messages, { timeoutMs = 180000 } = {}) {
		if (!this.ready()) {
			const error = new Error("Local inference binary or model is missing.");
			error.code = "local_model_unavailable";
			throw error;
		}
		const prompt = this.formatter.format(messages);
		return new Promise((resolve, reject) => {
			const child = this.spawnImpl(this.paths.binary, [
				this.paths.model,
				String(this.maximumTokens)
			], { stdio: ["pipe", "pipe", "pipe"] });
			let stdout = "";
			let stderr = "";
			const timeout = setTimeout(() => {
				child.kill("SIGKILL");
				reject(this.error("local_model_timeout"));
			}, timeoutMs);
			child.stdout.setEncoding("utf8");
			child.stderr.setEncoding("utf8");
			child.stdout.on("data", chunk => stdout += chunk);
			child.stderr.on("data", chunk => stderr += chunk);
			child.on("error", () => {
				clearTimeout(timeout);
				reject(this.error("local_model_process_failed"));
			});
			child.on("close", code => {
				clearTimeout(timeout);
				if (code !== 0) return reject(this.error("local_model_process_failed", stderr));
				const answer = this.clean(stdout);
				if (!answer) return reject(this.error("local_model_response_invalid"));
				resolve(answer);
			});
			child.stdin.end(prompt);
		});
	}

	clean(value) {
		return String(value)
			.replace(/<think>[\s\S]*?<\/think>/gi, "")
			.replace(/^\s*Assistant:\s*/i, "")
			.trim();
	}

	error(code) {
		const error = new Error("Local inference did not complete safely.");
		error.code = code;
		return error;
	}
}
