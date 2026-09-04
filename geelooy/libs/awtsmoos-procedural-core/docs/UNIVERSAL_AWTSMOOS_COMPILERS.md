# B"H

# Universal Compiler Federation

> The Awtsmoos renews one semantic intention through many specialist vessels; Awtsmoos.com lets compilers declare their power openly while private executors remain guarded and trusted.

## Compiler manifest

A public compiler capability is serializable and executor-free. It may declare:

- `id`, `compilerVersion`;
- semantic `kinds`;
- structured `requires`, plus `requiredTraits` and `optionalTraits` authoring aliases;
- `providesTraits`, semantic `supports`, and `supportPolicy`;
- artifact `channels`;
- `inputSchema` and compiler `dependencies`;
- `execution` mechanism and `executionTier`;
- `supportState`: `native`, `adapter`, `deferred`, or `unsupported`;
- `determinism`: deterministic, seeded, or environment-dependent;
- adapters, cost hints, LOD policy, quality policies;
- examples, diagnostic codes, stability, description, metadata.

Trusted executor functions are stored privately in the registry and never returned from capability discovery.

## Support-state truth

Support state changes planning and execution, not just documentation:

- `native` and `adapter` capabilities can satisfy channel coverage and execute when a trusted executor exists.
- `deferred` capabilities can describe future/planned channel coverage, but their executor is never invoked even if one was accidentally registered.
- `unsupported` capabilities cannot satisfy requested channel coverage and are rejected from accepted compiler chains.

This distinction makes plans useful for AI/RAG and human diagnostics without turning capability metadata into a false promise.

## Registration

```js
const awtsmoos=createAwtsmoos({
	compilers:[{
		capability:{
			id:'example.visual',
			version:'1.0.0',
			kinds:['architecture.*'],
			requiredTraits:['solid'],
			channels:['visual','metadata'],
			execution:'native-language',
			supportState:'native',
			determinism:'seeded',
			cost:{triangles:1200},
			diagnosticCodes:['EXAMPLE001']
		},
		executor:({definition,request})=>({
			id:definition.id,
			channels:request.required
		})
	}]
});
```

## Built-in Modeling bridge

The high-level facade installs `awtsmoos.modeling-document.core-bridge` by default. It accepts the explicit semantic kind `modeling.document` and lowers through the pre-existing ModelingDocument/ProceduralObject authority. Low-level semantic kernels remain compiler-empty until an installer or caller registers capabilities.

## Adapters and deferred work

Three.js, Blender, MitzvahWorld, remote texture/material systems, and other renderer/domain integrations remain specialist authorities. The federation describes adapters and channels without pretending every host integration is universally native.
