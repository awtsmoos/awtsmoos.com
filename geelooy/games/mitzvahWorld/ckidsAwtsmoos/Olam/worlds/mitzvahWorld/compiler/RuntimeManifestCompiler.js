/**
 * B"H
 * Chapter 40: The Manifest Became A Living Tongue.
 */

export class RuntimeManifestCompiler {
  compile(manifest = {}) {
    return {
      objects: Object.values(manifest.objects || {}),
      interactions: Object.values(manifest.interactions || {}),
      systems: Object.keys(manifest.systems || {})
    };
  }

  validate(compiled) {
    const ok = Array.isArray(compiled.objects)
      && Array.isArray(compiled.interactions)
      && Array.isArray(compiled.systems);
    return { ok, counts: this.counts(compiled) };
  }

  counts(compiled) {
    return {
      objects: compiled.objects.length,
      interactions: compiled.interactions.length,
      systems: compiled.systems.length
    };
  }
}

export default RuntimeManifestCompiler;
