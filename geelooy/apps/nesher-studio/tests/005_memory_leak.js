/* B"H
Stress test specification: 005_memory_leak.
Raw media outputs must be created outside the repository.
*/
export const testSpec = {
  id: '005_memory_leak',
  artifactRoot: '/tmp/nesher-studio-tests',
  durationSeconds: 60,
  assertions: ['no-crash', 'bounded-memory', 'structured-report']
};
export function describe() { return `${testSpec.id} -> ${testSpec.artifactRoot}`; }
