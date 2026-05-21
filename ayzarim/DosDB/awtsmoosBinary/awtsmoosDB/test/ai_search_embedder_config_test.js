// B"H
/**
 * @file ai_search_embedder_config_test.js
 * @description
 * Verifies the AwtsmoosDB AI-search embedder config points at the selected
 * GGUF model and exposes honest readiness state.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
    loadEmbedderConfig,
    getDefaultEmbedderConfig,
    resolveEmbedderModelPath
} = require("../../../aiSearch/embedderConfig.js");
const {
    assertGgufEmbedderReady,
    embedTextWithConfiguredGguf
} = require("../../../aiSearch/ggufEmbedder.js");

const config = loadEmbedderConfig();
assert.equal(config.defaultProvider, "gguf-bge-small-en-v1.5-q8_0");

const provider = getDefaultEmbedderConfig();
assert.equal(provider.kind, "gguf");
assert.equal(provider.repoId, "ggml-org/bge-small-en-v1.5-Q8_0-GGUF");
assert.equal(provider.filename, "bge-small-en-v1.5-q8_0.gguf");
assert.equal(provider.downloadUrl, "https://huggingface.co/ggml-org/bge-small-en-v1.5-Q8_0-GGUF/resolve/main/bge-small-en-v1.5-q8_0.gguf");
assert.equal(provider.expectedBytes, 36685152);
assert.equal(provider.embeddingDimensions, 384);
assert.equal(provider.task, "feature-extraction");
assert.equal(provider.language, "en");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-embedder-config-"));
assert.equal(
    resolveEmbedderModelPath(root, provider),
    path.join(root, "models", provider.filename)
);

const readiness = assertGgufEmbedderReady({ rootOrPath: root, provider });
assert.equal(readiness.modelExists, false);
assert.equal(readiness.ok, false);

(async () => {
    try {
        await embedTextWithConfiguredGguf("find this comment", { rootOrPath: root, provider });
        assert.fail("embedTextWithConfiguredGguf should fail honestly when runner/model are missing");
    } catch (error) {
        assert.equal(error.code, "GGUF_EMBEDDER_NOT_READY");
        assert.equal(error.readiness.modelExists, false);
    }
    console.log('B"H ai_search_embedder_config_test passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
