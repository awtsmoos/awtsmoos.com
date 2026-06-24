/* B"H */
export function createVirtualCamera(input = {}) { return { kind:'VirtualCamera', state:input.state || 'available-architecture', stream:input.stream || null }; }
export function attachVirtualCameraStream(camera, stream) { camera.stream = stream; camera.state = 'attached'; return camera; }
