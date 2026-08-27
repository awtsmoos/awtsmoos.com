import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWebmMuxer } from '../modules/recording/webmMuxerFactory.js';
import { targetBuffer } from '../modules/recording/container/webmTarget.js';
import { encoderAvailable, findRequiredTools, run } from './helpers/ffmpegTools.mjs';
import { assertIvfTiming, parseIvf } from './helpers/ivfParser.mjs';
import { assertProbe, decodeWebm, probeWebm } from './helpers/webmProbeAssertions.mjs';

const { tools, missing } = findRequiredTools(['ffmpeg', 'ffprobe']);
if (missing.length) {
  console.log(`B"H real ffprobe smoke skipped: missing ${missing.join(', ')} on this machine.`);
  process.exit(0);
}

const dir = await mkdtemp(join(tmpdir(), 'nesher-real-webm-'));
const summaries = [];
try {
  summaries.push(await runFixture({ dir, name:'vp8-160x90', width:160, height:90, fps:12, seconds:1.5, codecName:'vp8', ivfCodec:'VP80', ffCodec:'libvpx', muxCodec:'V_VP8', mimeCodec:'vp8', minSize:2000 }));
  summaries.push(await runFixture({ dir, name:'vp8-192x108', width:192, height:108, fps:15, seconds:1.2, codecName:'vp8', ivfCodec:'VP80', ffCodec:'libvpx', muxCodec:'V_VP8', mimeCodec:'vp8', minSize:2000 }));
  if (encoderAvailable(tools.ffmpeg, 'libvpx-vp9')) summaries.push(await runFixture({ dir, name:'vp9-160x90', width:160, height:90, fps:10, seconds:1, codecName:'vp9', ivfCodec:'VP90', ffCodec:'libvpx-vp9', muxCodec:'V_VP9', mimeCodec:'vp9', minSize:1200 }));
  console.log(`B"H local WebM real ffprobe smoke passed ${JSON.stringify(summaries)}`);
} finally { await rm(dir, { recursive:true, force:true }); }

async function runFixture(spec) {
  const ivf = join(spec.dir, `${spec.name}.ivf`), webm = join(spec.dir, `${spec.name}.webm`);
  run(tools.ffmpeg, ffmpegIvfArgs(spec, ivf));
  const parsed = parseIvf(await readFile(ivf));
  assert.equal(parsed.codec, spec.ivfCodec); assert.equal(parsed.width, spec.width); assert.equal(parsed.height, spec.height);
  assertIvfTiming(parsed, spec.fps);
  const { muxer, target } = await createWebmMuxer({ width:parsed.width, height:parsed.height, fps:spec.fps, video:{ muxCodec:spec.muxCodec, mimeCodec:spec.mimeCodec } });
  for (const frame of parsed.frames) muxer.addVideoChunk(frame.chunk, {});
  muxer.finalize(); await writeFile(webm, Buffer.from(targetBuffer(target)));
  const summary = assertProbe(probeWebm(tools, webm), spec);
  decodeWebm(tools, webm);
  return summary;
}

function ffmpegIvfArgs(spec, out) {
  return ['-y','-v','error','-f','lavfi','-i',`testsrc2=size=${spec.width}x${spec.height}:rate=${spec.fps}:duration=${spec.seconds}`,'-an','-c:v',spec.ffCodec,'-deadline','good','-cpu-used','4','-f','ivf',out];
}
