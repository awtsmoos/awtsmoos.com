// B"H
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const index = readFileSync('geelooy/style/geelooy-system/index.css', 'utf8');
const modules = ['tokens','typography','spacing','buttons','cards','forms','dock','header','dialogs','search','layout','responsive','motion','accessibility','notifications','composer','components','tabs','breadcrumbs','home','profile','heichelos-index','heichel'];
for (const name of modules) {
  assert.ok(existsSync(`geelooy/style/geelooy-system/${name}.css`), `missing ${name}.css`);
  assert.ok(index.includes(`./${name}.css`), `index must import ${name}.css`);
}
console.log('B"H geelooyDesignSystemManifest.test passed');
