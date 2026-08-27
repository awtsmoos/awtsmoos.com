/* B"H
ExportPipeline turns editor intent into concrete export options and queue jobs.
It describes MP4/HLS/thumbnail paths; byte production remains WebCodecs/muxer work.
*/
import { createExportQueue, enqueueExport, runNextExport } from './ExportQueue.js';
import { h264ConfigFromPreset } from './H264Encoder.js';
import { aacConfigFromPreset } from './AACEncoder.js';
import { describeMp4Artifact } from './Mp4Exporter.js';
import { buildMediaPlaylist } from './HlsExporter.js';
import { describeThumbnailArtifact } from './ThumbnailExporter.js';
import { validateExportPlan } from './Validation.js';
export const EXPORT_PRESETS = [
  { id:'mobile-720p', label:'Mobile 720p MP4', format:'mp4', width:1280, height:720, fps:30, videoBitrate:2500000, audioBitrate:128000 },
  { id:'desktop-1080p', label:'Desktop 1080p MP4', format:'mp4', width:1920, height:1080, fps:30, videoBitrate:5000000, audioBitrate:192000 },
  { id:'stream-hls-720p', label:'Live HLS 720p', format:'hls', width:1280, height:720, fps:30, videoBitrate:3500000, audioBitrate:128000 },
  { id:'thumb-1280', label:'Thumbnail 1280px', format:'thumbnail', width:1280, height:720 }
];
export function createExportPipeline(input = {}) { return { kind:'ExportPipeline', presets:input.presets || EXPORT_PRESETS, queue:createExportQueue(input.queue || {}) }; }
export function makeExportPlan(pipeline, presetId, overrides = {}) { const preset = { ...pipeline.presets.find(p=>p.id===presetId), ...overrides }; const plan = { ...preset, video:h264ConfigFromPreset(preset), audio:aacConfigFromPreset(preset) }; plan.validation = validateExportPlan(plan); return plan; }
export function queueExportPlan(pipeline, plan, name = plan.label) { return enqueueExport(pipeline.queue, { name, preset:plan, validation:plan.validation.checks }); }
export async function runDescriptorExport(pipeline) { return runNextExport(pipeline.queue, async job => job.preset.format === 'hls' ? { kind:'hls', playlist:buildMediaPlaylist([{ name:'seg-000000.ts', duration:2 }], { end:true }) } : job.preset.format === 'thumbnail' ? describeThumbnailArtifact(job, job.preset) : describeMp4Artifact(job, 0)); }
