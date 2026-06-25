// B"H
import fs from 'node:fs/promises';

const files = {
  apps: 'geelooy/apps/style.css',
  ai: 'geelooy/ai/styles.css',
  aiPolish: 'geelooy/ai/css/civilization/page-polish.css',
  email: 'geelooy/email/styles.css',
  postMain: 'geelooy/heichelos/post/styles/main.css',
  postPolish: 'geelooy/heichelos/post/styles/civilization/page-polish.css'
};
const checks = [];
function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}
async function read(key) { return fs.readFile(files[key], 'utf8'); }

try {
  const apps = await read('apps');
  assert(apps.includes('.apps'), 'appsSelectorPreserved');
  assert(apps.includes('.chrystalis-nav'), 'chrystalisNavPreserved');
  assert(apps.includes('@media (max-width: 700px)'), 'appsResponsive');

  const ai = await read('ai');
  const aiPolish = await read('aiPolish');
  assert(ai.includes('./css/civilization/page-polish.css'), 'aiImportsCivilizationPolish');
  assert(aiPolish.includes('focus-visible'), 'aiFocusVisible');
  assert(aiPolish.includes('prefers-reduced-motion'), 'aiReducedMotion');

  const email = await read('email');
  assert(email.includes('.thread-item'), 'emailThreadItemPreserved');
  assert(email.includes('.fab-compose'), 'emailComposePreserved');
  assert(email.includes('@media (max-width: 850px)'), 'emailMobilePreserved');

  const postMain = await read('postMain');
  const postPolish = await read('postPolish');
  assert(postMain.includes('./civilization/page-polish.css'), 'postImportsCivilizationPolish');
  assert(postPolish.includes('blockquote'), 'postBlockquotePolished');
  assert(postPolish.includes('prefers-reduced-motion'), 'postReducedMotion');

  for (const [key, path] of Object.entries(files)) {
    const text = await fs.readFile(path, 'utf8');
    assert(!text.includes('/api/v2/social'), `${key}NoV2`);
    assert(text.length < 20000, `${key}ScopedLength`, { length: text.length });
  }

  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
