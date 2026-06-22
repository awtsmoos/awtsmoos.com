// B"H
/** Argument helpers for the Actual Gameplay Profiler. */
export const DEFAULT_URL = 'http://localhost:8080/games/mitzvahWorld/';
export const RESULT_DIR = '/tmp/awtsmoos-mitzvahWorld-profiler-results';
export const RESULT_FILE = 'actual-gameplay-latest.json';

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

export function profilerOptions() {
  return {
    url: argValue('url', DEFAULT_URL),
    durationMs: Number(argValue('duration', '9000')),
    headed: argFlag('headed'),
    outDir: argValue('outDir', RESULT_DIR),
    settleMs: Number(argValue('settle', '1000')),
    gameplayQuietMs: Number(argValue('gameplayQuiet', '2500')),
    maxReadyWaitMs: Number(argValue('maxReadyWait', '45000')),
    debugPort: Number(argValue('debugPort', String(9700 + Math.floor(Math.random() * 500))))
  };
}
