// B"H
import { capabilityRecord, providerCapabilities, providerKind } from "./capabilities.js";

export class ProviderRegistry {
  constructor(providers = []) { this.map = new Map(); providers.forEach(p => this.register(p)); }
  register(provider = {}) { const id = provider.id || providerKind(provider); this.map.set(id, normalizeProvider({ ...provider, id })); return this.get(id); }
  get(id = "virtual") { return this.map.get(id) || normalizeProvider({ id, kind:id }); }
  describe(node = {}) { const provider = this.get(node.providerId || providerKind(node)); return { ...node, provider:provider.kind, providerId:provider.id, capabilities:providerCapabilities({ ...provider, ...node }), capability:capabilityRecord({ ...provider, ...node }) }; }
  list() { return [...this.map.values()].map(p => ({ ...p })); }
}

export function normalizeProvider(input = {}) {
  const kind = providerKind(input);
  const id = input.id || kind;
  return { id, kind, title:input.title || id, icon:input.icon || "◌", capabilities:providerCapabilities({ ...input, provider:kind }), metadata:{ ...(input.metadata || {}) } };
}

export function makeProviderRegistry(providers) { return new ProviderRegistry(providers); }

/** B"H: providers are garments. Objects remain one, while garments declare motion. */
