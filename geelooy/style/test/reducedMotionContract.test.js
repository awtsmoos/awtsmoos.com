// B"H
/**
 * Chapter 5: The mercy of stillness.
 *
 * Motion can be revelation, but forced motion can become exile. Every domain
 * that declares reduced-motion responsibility must point to a real vessel that
 * contains the `prefers-reduced-motion` covenant.
 */
const assert = require('assert');
const fs = require('fs');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const manifest = readJson('geelooy/style/contracts/visual-domains.json');
const obligations = manifest.domains.flatMap(domain =>
  (domain.reducedMotionFiles || []).map(file => ({ domain: domain.name, file }))
);

assert(obligations.length, 'at least one visual domain must declare reduced-motion responsibility');

for (const obligation of obligations) {
  assert(fs.existsSync(obligation.file), `${obligation.domain} reduced motion file missing ${obligation.file}`);
  const text = fs.readFileSync(obligation.file, 'utf8');
  assert(text.includes('prefers-reduced-motion'), `${obligation.domain} reduced motion file lacks prefers-reduced-motion`);
}

console.log('B"H reducedMotionContract.test passed');
