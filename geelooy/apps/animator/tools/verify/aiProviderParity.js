// B"H
import { readFileSync, readdirSync, statSync } from 'fs';
import { extname, resolve } from 'path';

const providerNames = ['OpenAI', 'Claude', 'Gemini', 'Anthropic', 'Ollama', 'Local'];
const requiredProviders = ['OpenAI', 'Claude', 'Gemini'];
const actionTerms = ['LoopEngineController', 'executeBatch', 'FileSystemProvider', 'awtsmoosTunnel', 'tunnelName'];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else if (extname(path) === '.js') files.push(path);
  }
  return files;
}

const root = process.cwd();
const files = [...walk(resolve(root, 'src')), ...walk(resolve(root, 'js'))];
const hits = Object.fromEntries(providerNames.map(name => [name, []]));
const actionHits = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const name of providerNames) {
    if (text.includes(name)) hits[name].push(file.slice(root.length + 1));
  }
  if (actionTerms.some(term => text.includes(term))) actionHits.push(file.slice(root.length + 1));
}

const missingRequiredProviders = requiredProviders.filter(name => hits[name].length === 0);
const universalProviderParity = missingRequiredProviders.length === 0;
const report = {
  files: files.length,
  providerHits: hits,
  actionRoutingFiles: [...new Set(actionHits)],
  requiredProviders,
  missingRequiredProviders,
  universalProviderParity,
  conclusion: universalProviderParity
    ? 'Provider names exist in repo; deeper runtime tests still required.'
    : 'Universal external-AI action parity is NOT implemented/proven in this repo.'
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = universalProviderParity ? 0 : 2;
