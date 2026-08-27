// B"H
import { spawnSync } from 'child_process';

const files = [
  'js/vibe/vibe-view.js',
  'js/vibe/modules/loop/LoopEngineController.js',
  'js/vibe/modules/ExternalManifest.js',
  'js/vibe/view/timeline/renderer.js',
  'js/tabs/index.js',
  'src/debug/DebugSystem.js',
  'src/debug/RenderInvariantProbe.js',
  'src/ui/components/panels/ai/events/AIEvents.js',
  'src/ui/components/panels/ai/engine/AIProviderRegistry.js',
  'src/ui/components/panels/ai/engine/GeminiEngine.js',
  'src/ui/components/panels/ai/engine/OpenAIEngine.js',
  'src/ui/components/panels/ai/engine/ClaudeEngine.js',
  'tools/verify/importGraph.js',
  'tools/verify/syntaxAll.js',
  'tools/verify/fastSyntax.js',
  'tools/verify/legacyVibeSmoke.js',
  'tools/verify/aiProviderParity.js',
  'tools/verify/aiProviderSmoke.js',
  'tools/verify/awtsmoosPerfectAudit.js'
];

/**
 * Checks one high-leverage file without sweeping the whole mobile repo.
 * @param {string} file repo-relative file path.
 * @returns {{file:string, ok:boolean, stderr:string}}
 */
function check(file) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  return { file, ok: result.status === 0, stderr: result.stderr || '' };
}

const failures = files.map(check).filter(result => !result.ok);
console.log(JSON.stringify({ files: files.length, failures: failures.length, failedFiles: failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
