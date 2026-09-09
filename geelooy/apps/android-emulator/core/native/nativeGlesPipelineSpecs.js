//B"H
//Boruch Hashem
//Blessed is He

const s = (name, method, ...types) => Object.freeze({ method, name, types: Object.freeze(types) });

/**
 * Declares core GLES render-state ABI signatures and their WebGL2 method equivalents.
 * The Awtsmoos renews one semantic table while Awtsmoos.com avoids duplicated hand-written dispatch.
 */
export const NATIVE_GLES_PIPELINE_SPECS = Object.freeze([
	s("glBlendColor", "blendColor", "f32", "f32", "f32", "f32"),
	s("glBlendEquation", "blendEquation", "u32"),
	s("glBlendEquationSeparate", "blendEquationSeparate", "u32", "u32"),
	s("glBlendFunc", "blendFunc", "u32", "u32"),
	s("glBlendFuncSeparate", "blendFuncSeparate", "u32", "u32", "u32", "u32"),
	s("glClear", "clear", "u32"),
	s("glClearColor", "clearColor", "f32", "f32", "f32", "f32"),
	s("glClearDepth", "clearDepth", "f64"),
	s("glClearDepthf", "clearDepth", "f32"),
	s("glClearStencil", "clearStencil", "i32"),
	s("glColorMask", "colorMask", "bool", "bool", "bool", "bool"),
	s("glCullFace", "cullFace", "u32"),
	s("glDepthFunc", "depthFunc", "u32"),
	s("glDepthMask", "depthMask", "bool"),
	s("glDepthRange", "depthRange", "f64", "f64"),
	s("glDepthRangef", "depthRange", "f32", "f32"),
	s("glDisable", "disable", "u32"),
	s("glEnable", "enable", "u32"),
	s("glFinish", "finish"),
	s("glFlush", "flush"),
	s("glFrontFace", "frontFace", "u32"),
	s("glLineWidth", "lineWidth", "f32"),
	s("glReadBuffer", "readBuffer", "u32"),
	s("glScissor", "scissor", "i32", "i32", "i32", "i32"),
	s("glStencilFunc", "stencilFunc", "u32", "i32", "u32"),
	s("glStencilFuncSeparate", "stencilFuncSeparate", "u32", "u32", "i32", "u32"),
	s("glStencilMask", "stencilMask", "u32"),
	s("glStencilMaskSeparate", "stencilMaskSeparate", "u32", "u32"),
	s("glStencilOp", "stencilOp", "u32", "u32", "u32"),
	s("glStencilOpSeparate", "stencilOpSeparate", "u32", "u32", "u32", "u32"),
	s("glViewport", "viewport", "i32", "i32", "i32", "i32")
]);
