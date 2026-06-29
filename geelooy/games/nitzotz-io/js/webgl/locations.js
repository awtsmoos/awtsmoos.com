// B"H

/** B"H: Locations are gathered once, so each frame can move like water. */
export function locations(gl, program) {
  return {
    aPos: gl.getAttribLocation(program, 'aPos'),
    aNormal: gl.getAttribLocation(program, 'aNormal'),
    uVP: gl.getUniformLocation(program, 'uVP'),
    uPos: gl.getUniformLocation(program, 'uPos'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uRot: gl.getUniformLocation(program, 'uRot'),
    uColor: gl.getUniformLocation(program, 'uColor'),
    uAlpha: gl.getUniformLocation(program, 'uAlpha'),
    uGlow: gl.getUniformLocation(program, 'uGlow')
  };
}
