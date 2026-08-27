// B"H
import { VibeView } from '../../js/vibe/vibe-view.js';
import { TimelineRenderer } from '../../js/vibe/view/timeline/renderer.js';
import { LoopEngineController } from '../../js/vibe/modules/loop/LoopEngineController.js';
import { ExternalManifest } from '../../js/vibe/modules/ExternalManifest.js';
import { Tabs } from '../../js/tabs/index.js';

const checks = [
  ['VibeView.render', typeof VibeView.render === 'function'],
  ['TimelineRenderer.renderRecord', typeof TimelineRenderer.renderRecord === 'function'],
  ['LoopEngineController.executeBatch', typeof LoopEngineController.executeBatch === 'function'],
  ['ExternalManifest.injectUI', typeof ExternalManifest.injectUI === 'function'],
  ['Tabs.create', typeof Tabs.create === 'function']
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ checks: checks.length, failures: failures.length, failedExports: failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
