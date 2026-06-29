import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const smokes = [
  'tests/011_project_model_smoke.mjs',
  'tests/027_timeline_model_smoke.mjs',
  'tests/029_export_queue_smoke.mjs',
  'tests/030_project_serializer_smoke.mjs',
  'tests/039_timeline_editing_smoke.mjs',
  'tests/042_nle_timeline_commands_smoke.mjs',
  'tests/043_nle_render_smoke.mjs',
  'tests/044_export_negotiator_smoke.mjs',
  'tests/045_audio_visualizer_smoke.mjs',
  'tests/046_visualizer_routing_features_smoke.mjs',
  'tests/047_encoding_benchmark_smoke.mjs',
  'tests/048_visualizer_source_family_smoke.mjs',
  'tests/049_visualizer_audio_features_smoke.mjs',
  'tests/050_live_stream_health_smoke.mjs',
  'tests/051_nle_tracks_commands_smoke.mjs',
  'tests/052_encoding_recommendation_smoke.mjs',
  'tests/053_no_media_recorder_guard_smoke.mjs',
  'tests/054_browser_confidence_layer_smoke.mjs',
  'tests/055_mock_generic_hls_controller_smoke.mjs',
  'tests/056_benchmark_compact_view_smoke.mjs'
];
let failures = 0;
for (const smoke of smokes) failures += runSmoke(smoke);
const lineHits = lineViolations();
if (lineHits.length) { failures += 1; console.error('Line-count violations:\n' + lineHits.join('\n')); }
if (failures) process.exitCode = 1;
else console.log('B"H Nesher confidence layer runner passed');

function runSmoke(smoke) {
  const result = spawnSync(process.execPath, [join(root, smoke)], { cwd:root, encoding:'utf8' });
  process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
  if (result.status === 0) return 0;
  console.error(`FAILED ${smoke} with exit ${result.status}`); return 1;
}
function lineViolations() {
  return targets().map(file => [file, countLines(file)]).filter(([, n]) => n > 120).map(([file, n]) => `${relative(root, file)} has ${n} lines`);
}
function targets() {
  return [join(root, 'main.js'), ...walk(join(root, 'modules'), file => extname(file) === '.js'), ...readdirSync(join(root, 'tests')).filter(f => extname(f) === '.mjs').map(f => join(root, 'tests', f))];
}
function walk(dir, keep) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name), stat = statSync(path);
    return stat.isDirectory() ? walk(path, keep) : keep(path) ? [path] : [];
  });
}
function countLines(file) { return readFileSync(file, 'utf8').split('\n').length; }
