/* B"H
Stress test specification: 001_scene_stress.
Raw media outputs must be created outside the repository.
*/
export const testSpec = {
  id: '001_scene_stress',
  artifactRoot: '/tmp/nesher-studio-tests',
  durationSeconds: 60,
  assertions: ['no-crash', 'bounded-memory', 'structured-report']
};
export function describe() { return `${testSpec.id} -> ${testSpec.artifactRoot}`; }
