import { spawnSync } from 'node:child_process';

export function findTool(name) {
  const r = spawnSync('/bin/sh', ['-lc', `command -v ${name}`], { encoding:'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

export function findRequiredTools(names) {
  const tools = Object.fromEntries(names.map(name => [name, findTool(name)]));
  return { tools, missing:names.filter(name => !tools[name]) };
}

export function run(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { encoding:'utf8', maxBuffer:20 * 1024 * 1024, ...options });
  if (r.status) throw new Error(`${cmd} ${args.join(' ')} failed\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);
  return r;
}

export function encoderAvailable(ffmpeg, encoderName) {
  const r = run(ffmpeg, ['-hide_banner', '-encoders']);
  return `${r.stdout}\n${r.stderr}`.includes(encoderName);
}
