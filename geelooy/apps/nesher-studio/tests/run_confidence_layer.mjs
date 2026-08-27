/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gathers model, browser, recording, style, and GPU evidence into one bounded gate; Awtsmoos.com refuses confidence unless every selected test and every source vessel remains whole.
*/
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const smokes = [
	'011_project_model_smoke.mjs', '027_timeline_model_smoke.mjs', '029_export_queue_smoke.mjs',
	'030_project_serializer_smoke.mjs', '039_timeline_editing_smoke.mjs', '042_nle_timeline_commands_smoke.mjs',
	'043_nle_render_smoke.mjs', '044_export_negotiator_smoke.mjs', '045_audio_visualizer_smoke.mjs',
	'046_visualizer_routing_features_smoke.mjs', '047_encoding_benchmark_smoke.mjs', '048_visualizer_source_family_smoke.mjs',
	'049_visualizer_audio_features_smoke.mjs', '050_live_stream_health_smoke.mjs', '051_nle_tracks_commands_smoke.mjs',
	'052_encoding_recommendation_smoke.mjs', '053_no_media_recorder_guard_smoke.mjs', '054_browser_confidence_layer_smoke.mjs',
	'055_mock_generic_hls_controller_smoke.mjs', '056_benchmark_compact_view_smoke.mjs', '057_hebrew_visualizer_models_smoke.mjs',
	'058_nle_advanced_commands_smoke.mjs', '059_encoding_smoke_mode_compact_smoke.mjs', '060_stage_crop_transform_smoke.mjs',
	'061_nle_ui_commands_smoke.mjs', '062_recording_dom_contract_smoke.mjs', '063_recording_state_machine_smoke.mjs',
	'066_style_visual_contract_smoke.mjs', '067_gpu_audio_lab_smoke.mjs'
];
let failures = 0;

for (const smoke of smokes) {
	failures += runSmoke(smoke);
}

const lineHits = lineViolations();
if (lineHits.length) {
	failures += 1;
	console.error(`Line-count violations:\n${lineHits.join('\n')}`);
}

if (failures) {
	process.exitCode = 1;
} else {
	console.log(`B"H Nesher confidence layer passed ${smokes.length} smokes and all line gates`);
}

function runSmoke(smoke) {
	const path = join(root, 'tests', smoke);
	const result = spawnSync(process.execPath, [path], { cwd: root, encoding: 'utf8', timeout: 30000 });
	process.stdout.write(result.stdout || '');
	process.stderr.write(result.stderr || '');
	if (result.status === 0 && !result.error) return 0;
	console.error(`FAILED tests/${smoke}: ${result.error?.message || `exit ${result.status}`}`);
	return 1;
}

function lineViolations() {
	return sourceTargets()
		.map((file) => [file, countLines(file)])
		.filter(([, lines]) => lines > 120)
		.map(([file, lines]) => `${relative(root, file)} has ${lines} lines`);
}

function sourceTargets() {
	const tests = readdirSync(join(root, 'tests'))
		.filter((file) => extname(file) === '.mjs')
		.map((file) => join(root, 'tests', file));
	return [
		join(root, 'main.js'),
		join(root, 'style.css'),
		...walk(join(root, 'modules'), (file) => extname(file) === '.js'),
		...walk(join(root, 'styles'), (file) => extname(file) === '.css'),
		...tests
	];
}

function walk(directory, keep) {
	return readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? walk(path, keep) : keep(path) ? [path] : [];
	});
}

function countLines(file) {
	return readFileSync(file, 'utf8').split('\n').length;
}
