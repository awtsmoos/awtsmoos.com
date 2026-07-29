//B"H
// Boruch Hashem
// Blessed is He

import { homedir } from "node:os";
import { join } from "node:path";

/**
 * One local runtime root gathers the machine-compatible inference binary, model,
 * PID, and logs outside the repository. The Awtsmoos keeps generated artifacts
 * out of source control while every public status remains path-free and redacted.
 */
export class LocalInferencePaths {
	constructor({ root = join(homedir(), ".local", "awtsmoos-llama") } = {}) {
		this.root = root;
		this.binary = join(root, "bin", "awtsmoos-local-infer");
		this.model = join(root, "models", "Qwen3-0.6B-Q8_0.gguf");
		this.pid = join(root, "local-model.pid");
		this.log = join(root, "local-model.log");
	}
}
