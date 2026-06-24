/* B"H */
export function createProgramCanvas(input = {}) { return { kind:'ProgramCanvas', canvas:input.canvas || null, sceneId:input.sceneId || null, live:!!input.live }; }
export function setProgramScene(program, sceneId) { program.sceneId = sceneId; return program; }
