// B"H
export function backendContract(name, capabilities = []) { return { name, capabilities, accepts:'sefiros_scene_plan' }; }
export const SEFIROS_BACKEND_CONTRACT = backendContract('sefiros_backend', ['scene', 'mesh_intent', 'light_intent', 'camera_intent', 'animation_intent']);
export default SEFIROS_BACKEND_CONTRACT;
