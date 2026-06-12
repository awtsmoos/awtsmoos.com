// B"H
const { providerFor, providerKey } = require("./providers.js");

/**
 * B"H
 * Chapter 344: Delegates Stood In A Circle Of Remembered Fire.
 *
 * The registry merges custom agents with defaults. Each delegate is a named
 * spark, ready only when its provider key is present. Thus no agent pretends to
 * have a mouth when the river of speech has not yet been opened.
 */
function configuredAgents(config = {}) {
  const custom = Array.isArray(config.aiAgents?.agents) ? config.aiAgents.agents : [];
  const defaults = [
    agent("openrouter-general", "OpenRouter General", "openrouter"),
    agent("minimax-deep", "MiniMax Deep Delegate", "minimax"),
    agent("groq-fast", "Groq Fast Delegate", "groq")
  ];
  const seen = new Set(custom.map(item => item.id));
  return [...custom, ...defaults.filter(item => !seen.has(item.id))];
}

function listAgents(config = {}) {
  return configuredAgents(config).map(agentConfig => ({
    id: agentConfig.id,
    name: agentConfig.name,
    provider: agentConfig.provider,
    model: agentConfig.model || providerFor(agentConfig.provider).defaultModel,
    description: agentConfig.description || agentConfig.name + " can think, write, summarize, and spawn.",
    ready: Boolean(providerKey(config, agentConfig.provider)),
    system: agentConfig.system ? "configured" : "default"
  }));
}

function resolveAgent(config = {}, id = "openrouter-general") {
  const found = configuredAgents(config).find(agentConfig => agentConfig.id === id);
  if (!found) throw new Error("Unknown AI agent: " + id);
  return found;
}

function agent(id, name, provider) {
  return { id, name, provider, description: name + " can brainstorm, critique, write, summarize, and delegate." };
}

module.exports = { configuredAgents, listAgents, resolveAgent };
