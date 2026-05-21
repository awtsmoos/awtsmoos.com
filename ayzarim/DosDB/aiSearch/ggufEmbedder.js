// B"H
/**
 * @file ggufEmbedder.js
 * @description
 * Runtime gate for GGUF embeddings. It does not pretend a vector exists unless
 * a local runner exists. This keeps AwtsmoosDB tests honest and reproducible.
 */

const fs = require("fs");
const childProcess = require("child_process");
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require("./embedderConfig.js");

function commandExists(command) {
    try {
        childProcess.execFileSync("bash", ["-lc", `command -v ${command}`], { stdio: "ignore" });
        return true;
    } catch (_) {
        return false;
    }
}

function detectGgufRunner() {
    if (commandExists("llama-embedding")) return { kind: "llama-embedding", command: "llama-embedding" };
    if (commandExists("llama-cli")) return { kind: "llama-cli", command: "llama-cli" };
    try {
        childProcess.execFileSync("python", ["-c", "import llama_cpp"], { stdio: "ignore" });
        return { kind: "llama-cpp-python", command: "python" };
    } catch (_) {
        return null;
    }
}

function assertGgufEmbedderReady({ rootOrPath, provider = getDefaultEmbedderConfig() } = {}) {
    const modelPath = resolveEmbedderModelPath(rootOrPath, provider);
    const runner = detectGgufRunner();
    return {
        ok: Boolean(runner && fs.existsSync(modelPath)),
        runner,
        modelPath,
        modelExists: fs.existsSync(modelPath),
        provider
    };
}

async function embedTextWithConfiguredGguf(text, options = {}) {
    const readiness = assertGgufEmbedderReady(options);
    if (!readiness.ok) {
        const missing = [];
        if (!readiness.runner) missing.push("gguf_runner");
        if (!readiness.modelExists) missing.push("model_file");
        const error = new Error(`B\"H GGUF embedder is not ready: missing ${missing.join(", ")}`);
        error.code = "GGUF_EMBEDDER_NOT_READY";
        error.readiness = readiness;
        throw error;
    }

    throw Object.assign(new Error("B\"H GGUF embedding execution is not wired for this runner yet."), {
        code: "GGUF_EMBEDDER_EXECUTION_NOT_IMPLEMENTED",
        readiness,
        textLength: String(text || "").length
    });
}

module.exports = {
    detectGgufRunner,
    assertGgufEmbedderReady,
    embedTextWithConfiguredGguf
};
