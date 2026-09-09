//B"H
//Boruch Hashem
//Blessed is He

/** Emits one immutable framebuffer/renderbuffer operation into the native graphics trace. */
export function traceNativeGlesFramebuffer(runtimeState, context, kind, payload) {
	runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ context: BigInt(context).toString(), kind, ...payload }));
}
