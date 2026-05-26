// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const streamModulePath = path.basename(here).toLowerCase() === 'dist'
  ? path.join(here, '..', 'core', 'merkavaExecutorRenderStream.js')
  : path.join(here, 'merkavaExecutorRenderStream.js');
const { buildMerkavaExecutorRenderStream } = await import(pathToFileURL(streamModulePath).href);

const [, , htmlPath, url = 'http://localhost:8080'] = process.argv;
if (!htmlPath) {
  console.error('missing htmlPath');
  process.exit(64);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const result = await buildMerkavaExecutorRenderStream({ html, scripts: [], url });

process.stdout.write('AWTS_EXECUTOR_RENDER_STREAM_BEGIN\n');
process.stdout.write(result.stream || '');
process.stdout.write('\nAWTS_EXECUTOR_RENDER_STREAM_END\n');
process.stdout.write(JSON.stringify({
  ok: true,
  dom: 'executor-owned',
  cHost: 'native-bindings-only',
  commandCount: result.summary.commandCount,
  streamBytes: result.summary.streamBytes,
  url
}) + '\n');
