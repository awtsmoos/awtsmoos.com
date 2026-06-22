// B"H
/** Small argument helpers for Stephen, the honest profiler witness. */
export const DEFAULT_URL = 'http://localhost:8080/games/mitzvahWorld/';
export const RESULT_DIR = '/tmp/awtsmoos-mitzvahWorld-profiler-results';
export const RESULT_FILE = 'stephen-latest.json';

export function argValue(name, fallback) {
  const found = process.argv.find(value => value.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : fallback;
}

export function argFlag(name) {
  return process.argv.includes(`--${name}`) || process.argv.includes(`--${name}=true`);
}

export function textFromArg(arg) {
  return String(arg.value ?? arg.description ?? arg.unserializableValue ?? arg.type ?? '');
}

export function stephenOptions() {
  return {
    url: argValue('url', DEFAULT_URL),
    durationMs: Number(argValue('duration', '9000')),
    headed: argFlag('headed'),
    outDir: argValue('outDir', RESULT_DIR),
    settleMs: Number(argValue('settle', '3500')),
    debugPort: Number(argValue('debugPort', String(9700 + Math.floor(Math.random() * 500))))
  };
}
