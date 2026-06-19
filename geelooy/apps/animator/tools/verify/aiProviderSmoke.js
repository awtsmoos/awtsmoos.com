// B"H
globalThis.localStorage = {
  data: new Map(),
  getItem(key) { return this.data.get(key) || null; },
  setItem(key, value) { this.data.set(key, String(value)); },
  removeItem(key) { this.data.delete(key); }
};
globalThis.prompt = () => '';
globalThis.fetch = async () => { throw new Error('Live network disabled for smoke test.'); };

const { AIProviderRegistry } = await import('../../src/ui/components/panels/ai/engine/AIProviderRegistry.js');

const providers = AIProviderRegistry.list();
const expected = ['gemini', 'openai', 'claude'];
const missing = expected.filter(id => !providers.some(provider => provider.id === id));
const invocations = [];
for (const id of expected) {
  const text = await AIProviderRegistry.invoke('smoke test', null, id);
  invocations.push({ id, ok: typeof text === 'string' && text.includes('B"H'), preview: text.slice(0, 80) });
}
const failedInvocations = invocations.filter(item => !item.ok);
const report = { providers, missing, invocations, failedInvocations };
console.log(JSON.stringify(report, null, 2));
process.exitCode = missing.length || failedInvocations.length ? 1 : 0;
