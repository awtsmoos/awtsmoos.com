// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

/**
 * Registers armatures, animation clips, scene metadata, and validation gates.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerSceneTimelineHandlers(registry) {
	registry.register("create_armature", {
		handler: (context, command) => {
			context.armatures.set(command.target, Object.freeze({
				id: command.target,
				...command.args
			}));
		}
	});
	registry.register("create_animation_clip", {
		handler: (context, command) => {
			context.animations.set(command.target, Object.freeze({
				id: command.target,
				type: "clip",
				...command.args
			}));
		}
	});
	registry.register("set_scene_metadata", {
		handler: (context, command) => {
			context.metadata = {
				...context.metadata,
				...command.args
			};
		}
	});
	registry.register("validate_artifact", {
		handler: () => null
	});
	return registry;
}
