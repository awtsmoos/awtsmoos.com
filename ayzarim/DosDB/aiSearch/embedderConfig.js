// B"H
/**
 * @file embedderConfig.js
 * @description
 * Loads the AwtsmoosDB AI-search embedder configuration. The model source is
 * explicit and testable; runtime embedding is separate so installs are never
 * guessed or hidden.
 */

const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "embedder.config.json");

function loadEmbedderConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function getDefaultEmbedderConfig() {
    const config = loadEmbedderConfig();
    return config.providers[config.defaultProvider];
}

function resolveEmbedderModelPath(rootOrPath, provider = getDefaultEmbedderConfig()) {
    const base = rootOrPath || process.cwd();
    return path.join(base, "models", provider.filename);
}

module.exports = {
    CONFIG_PATH,
    loadEmbedderConfig,
    getDefaultEmbedderConfig,
    resolveEmbedderModelPath
};
