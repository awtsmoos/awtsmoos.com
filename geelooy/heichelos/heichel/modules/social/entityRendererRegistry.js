//B"H
const registry = new Map();

export function registerEntityRenderer(type, renderer) {
  registry.set(type, renderer);
}

export function getEntityRenderer(type) {
  return registry.get(type) || null;
}

export function listEntityRenderers() {
  return [...registry.keys()];
}
