// B"H
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const index = readFileSync(join(root, 'geelooy/style/geelooy-system/index.css'), 'utf8');
const required = ['typography','spacing','layout','dialogs','search','notifications','composer','components','motion'];
for (const name of required) {
  if (!index.includes(`./${name}.css`)) throw new Error(`geelooy-system missing ${name}.css import`);
  if (!existsSync(join(root, `geelooy/style/geelooy-system/${name}.css`))) throw new Error(`missing module ${name}.css`);
}
for (const file of ['boot.js','dock.js','drawer.js','routes.js','scrollMemory.js','spotlight.js','notifications.js']) {
  if (!existsSync(join(root, `geelooy/scripts/awtsmoos/social/shell/${file}`))) throw new Error(`missing shell module ${file}`);
}
console.log('B"H geelooySystemExpansion.test passed');
