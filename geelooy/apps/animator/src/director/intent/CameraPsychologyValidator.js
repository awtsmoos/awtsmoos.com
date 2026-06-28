// B"H
export class CameraPsychologyValidator {
  static audit(scene = {}, plan = {}) {
    const cameras = scene.cameras || [], composition = plan.composition || [];
    const byId = Object.fromEntries(composition.map(item => [item.cameraId, item]));
    const checks = cameras.map(camera => {
      const item = byId[camera.id] || {}, isObject = String(camera.type).includes('object');
      return {
        cameraId: camera.id,
        hasIntent: Boolean(item.intent),
        hasRule: Boolean(item.rule),
        closeupHasFaceReason: isObject || !String(camera.renderDetailMode).includes('closeup') || item.rule === 'eyes_on_upper_third',
        objectShotHasLine: !isObject || item.leadingLine === 'puddleReflectionToLantern'
      };
    });
    const failed = checks.filter(row => Object.entries(row).some(([key, value]) => key !== 'cameraId' && !value));
    return { ok: failed.length === 0, failed, checked: checks.length };
  }
}
