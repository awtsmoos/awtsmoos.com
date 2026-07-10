// B"H
/** One command to plan, repair only broken chunks, and prove completion. */
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const workers = args.find(arg => arg.startsWith('--workers=')) || '--workers=100';
const retries = args.find(arg => arg.startsWith('--retries=')) || '--retries=3';
const model = args.find(arg => arg.startsWith('--model=')) || '--model=deepseek-chat';

function run(script, extra = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [`scripts/sichos_kodesh_ai/${script}`, ...extra], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${script} exited with code ${code}`)));
  });
}

async function main() {
  await run('mechanical_salvage.mjs');
  await run('repair_plan.mjs');
  await run('cost_projection.mjs');
  await run('run_repair.mjs', [workers, retries, model]);
  await run('mechanical_salvage.mjs');
  await run('repair_plan.mjs');
  await run('cost_projection.mjs');
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
