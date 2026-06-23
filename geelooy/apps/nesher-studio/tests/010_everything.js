/* B"H
Stress test specification: 010_everything.
Raw media outputs must be created outside the repository.
*/
export const testSpec = {
  id: '010_everything',
  artifactRoot: '/tmp/nesher-studio-tests',
  durationSeconds: 600,
  assertions: ['no-crash', 'bounded-memory', 'structured-report']
};
export function describe() { return `${testSpec.id} -> ${testSpec.artifactRoot}`; }
