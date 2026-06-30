import assert from 'node:assert/strict';
import { run } from './ffmpegTools.mjs';

export function probeWebm(tools, path) {
  const r = run(tools.ffprobe, [
    '-v','error','-show_entries','stream=codec_name,width,height,avg_frame_rate,duration,nb_read_frames',
    '-show_entries','format=format_name,duration,size','-count_frames','-of','json', path
  ]);
  return JSON.parse(r.stdout);
}

export function decodeWebm(tools, path) {
  run(tools.ffmpeg, ['-v','error','-i',path,'-f','null','-']);
}

export function assertProbe(probe, spec) {
  const stream = probe.streams?.find(item => item.codec_name === spec.codecName) || probe.streams?.[0];
  assert.ok(stream, 'missing probed video stream');
  assert.equal(stream.codec_name, spec.codecName);
  assert.equal(stream.width, spec.width);
  assert.equal(stream.height, spec.height);
  assert.match(probe.format?.format_name || '', /webm|matroska/);
  const duration = Number(probe.format?.duration || stream.duration || 0);
  assert.ok(duration > 0, 'duration must be positive');
  assert.ok(duration > spec.seconds * 0.5 && duration < spec.seconds * 2.5, `duration ${duration} outside fixture range`);
  assert.ok(Number(probe.format?.size || 0) > spec.minSize, 'output WebM too small');
  assertReasonableRate(stream.avg_frame_rate, spec.fps);
  return { codec:stream.codec_name, width:stream.width, height:stream.height, duration, size:Number(probe.format?.size || 0), frames:Number(stream.nb_read_frames || 0) };
}

function assertReasonableRate(rate, fps) {
  if (!rate || rate === '0/0') return;
  const [num, den] = rate.split('/').map(Number), value = den ? num / den : 0;
  assert.ok(value > fps * 0.5 && value < fps * 1.5, `unexpected avg_frame_rate ${rate}`);
}
