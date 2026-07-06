// B"H
export function generateShot(kind = "medium", at = 0) { return { kind, at, camera:{ position:[0, 3, 6], lookAt:[0, 1, 0] } }; }
export default { generateShot };
