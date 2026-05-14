// B"H

/**
 * @file identity.js
 * @description
 * B"H.
 *
 * The filesystem is a kingdom of worlds.
 * Each file-item is a vessel.
 * Each provider type is its breath.
 *
 * When an item arrives without a world type, the old code allowed the void
 * to reach the provider gate, where the crash became cryptic:
 *
 * "The world type 'undefined' has no strategy."
 *
 * This module makes that impossible to hide.
 * It normalizes identity before filesystem execution.
 * It preserves the original provider-world.
 * It refuses false vessels before they can shatter the UI.
 *
 * In the language of the code:
 * - type/originalType are required identity fields.
 * - provider/world/worldType/sourceType are accepted aliases only as recovery.
 * - github/GitHub and local/Local are normalized carefully.
 * - no silent guessing is allowed.
 *
 * In the language of the mashal:
 * The Awtsmoos creates every vessel every instant, but a vessel must still
 * carry its name. A file without its world-name is not a file yet; it is
 * only a shadow asking to become real.
 */

const TYPE_ALIAS_KEYS = Object.freeze([
  "originalType",
  "type",
  "worldType",
  "providerType",
  "provider",
  "sourceType"
]);

const CASE_PRESERVED_ALIASES = Object.freeze({
  GitHub: "github",
  Local: "local",
  SSH: "ssh",
  IndexedDB: "indexeddb",
  OSFolder: "osfolder",
  ZipEntry: "zip-entry",
  OPFS: "opfs",
  PostMessage: "postmessage",
  Relay: "relay"
});

/**
 * @constant {Set&lt;string&gt;} KNOWN_WORLD_TYPES
 * @description
 * B"H.
 *
 * The known filesystem worlds.
 * This list mirrors the real provider strategy names so validation can fail
 * early with a useful message instead of exploding later in fs-provider.
 */
export const KNOWN_WORLD_TYPES = new Set([
  "local",
  "Local",
  "ssh",
  "SSH",
  "indexeddb",
  "IndexedDB",
  "github",
  "GitHub",
  "osfolder",
  "OSFolder",
  "zip-entry",
  "ZipEntry",
  "opfs",
  "OPFS",
  "postmessage",
  "PostMessage",
  "relay",
  "Relay",
  "vibe-manager",
  "vibe-session",
  "devtools",
  "html-preview-file",
  "browser"
]);

/**
 * @function describeItemForError
 * @description
 * B"H.
 *
 * Turns a filesystem item into a compact diagnostic scroll.
 * No huge object dumps.
 * No circular JSON horror.
 * Just enough truth to find the broken caller.
 *
 * @param {object} item
 * The filesystem item, workspace item, git context item, tab item, or partial
 * object that failed provider identity validation.
 *
 * @returns {string}
 * A readable diagnostic string.
 */
export function describeItemForError(item) {
  if (!item || typeof item !== "object") {
    return `item=${String(item)}`;
  }

  const fields = {
    name: item.name,
    path: item.path,
    kind: item.kind,
    type: item.type,
    originalType: item.originalType,
    worldType: item.worldType,
    providerType: item.providerType,
    provider: item.provider,
    sourceType: item.sourceType,
    workspaceId: item.workspaceId,
    id: item.id
  };

  return Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ") || "item has no useful identity fields";
}

/**
 * @function normalizeWorldType
 * @description
 * B"H.
 *
 * Normalizes a world type without pretending to know what was never supplied.
 * This function is allowed to map obvious case aliases, but it is not allowed
 * to invent a filesystem strategy from path shape alone.
 *
 * @param {string} rawType
 * The raw type-like value found on a filesystem item.
 *
 * @returns {string|undefined}
 * The normalized type, or undefined if no usable type exists.
 */
export function normalizeWorldType(rawType) {
  if (typeof rawType !== "string") return undefined;

  const trimmed = rawType.trim();
  if (!trimmed) return undefined;

  return CASE_PRESERVED_ALIASES[trimmed] || trimmed;
}

/**
 * @function getWorldType
 * @description
 * B"H.
 *
 * Finds the world type on an item using strict ordered identity fields.
 *
 * The order matters:
 * 1. originalType is the preserved root provider.
 * 2. type is the immediate provider identity.
 * 3. alias fields are only rescue ropes for older callers.
 *
 * @param {object} item
 * The filesystem item.
 *
 * @returns {string|undefined}
 * The normalized provider type.
 */
export function getWorldType(item) {
  if (!item || typeof item !== "object") return undefined;

  for (const key of TYPE_ALIAS_KEYS) {
    const normalized = normalizeWorldType(item[key]);
    if (normalized) return normalized;
  }

  return undefined;
}

/**
 * @function assertKnownWorldType
 * @description
 * B"H.
 *
 * Verifies that a provider type has a registered strategy.
 *
 * @param {string} type
 * The provider type.
 *
 * @param {object} item
 * The related filesystem item.
 *
 * @param {string} action
 * The attempted filesystem operation.
 *
 * @returns {string}
 * The same provider type, if valid.
 *
 * @throws {Error}
 * Throws a precise error if the type is absent or unknown.
 */
export function assertKnownWorldType(type, item, action = "execute") {
  if (!type) {
    throw new Error(
      `[FileSystemProvider] Cannot ${action}: item is missing type/originalType. ` +
      `Every filesystem operation must carry a real provider world. ` +
      `Diagnostic: ${describeItemForError(item)}`
    );
  }

  if (!KNOWN_WORLD_TYPES.has(type)) {
    throw new Error(
      `[FileSystemProvider] Cannot ${action}: world type '${type}' has no strategy. ` +
      `Diagnostic: ${describeItemForError(item)}`
    );
  }

  return type;
}

/**
 * @function withWorldIdentity
 * @description
 * B"H.
 *
 * Returns a cloned item with stable type and originalType.
 * This is the gatekeeper that prevents undefined provider identity from
 * leaking into writes, creates, deletes, reads, lists, and Git metadata writes.
 *
 * @param {object} item
 * The incoming item.
 *
 * @param {object} [options]
 * Optional validation settings.
 *
 * @param {string} [options.action="execute"]
 * The operation name used in diagnostics.
 *
 * @param {boolean} [options.requireKnown=true]
 * Whether to verify against known provider names.
 *
 * @returns {object}
 * A cloned item with type and originalType filled.
 */
export function withWorldIdentity(item, options = {}) {
  const {
    action = "execute",
    requireKnown = true
  } = options;

  if (!item || typeof item !== "object") {
    throw new Error(
      `[FileSystemProvider] Cannot ${action}: expected item object, got ${String(item)}.`
    );
  }

  const type = getWorldType(item);

  if (requireKnown) {
    assertKnownWorldType(type, item, action);
  } else if (!type) {
    throw new Error(
      `[FileSystemProvider] Cannot ${action}: item is missing type/originalType. ` +
      `Diagnostic: ${describeItemForError(item)}`
    );
  }

  return {
    ...item,
    type,
    originalType: normalizeWorldType(item.originalType) || type
  };
}

/**
 * @function inheritWorldIdentity
 * @description
 * B"H.
 *
 * Creates a child filesystem item that inherits provider identity from a parent.
 * This is the exact repair needed for local Git anchor writes where a derived
 * `.awtsmoos-repo/ikar.js` item used to lose its world type.
 *
 * @param {object} parent
 * The parent/root/context item that owns the provider identity.
 *
 * @param {object} childFields
 * The child fields such as path, name, kind, sha, size, etc.
 *
 * @param {object} [options]
 * Optional validation settings.
 *
 * @param {string} [options.action="inherit identity"]
 * Diagnostic operation name.
 *
 * @returns {object}
 * A complete child item with provider identity preserved.
 */
export function inheritWorldIdentity(parent, childFields = {}, options = {}) {
  const base = withWorldIdentity(parent, {
    action: options.action || "inherit identity",
    requireKnown: true
  });

  return {
    ...base,
    ...childFields,
    type: base.type,
    originalType: base.originalType || base.type,
    workspaceId: childFields.workspaceId || base.workspaceId || base.id
  };
}

/**
 * @function isGitHubWorld
 * @description
 * B"H.
 *
 * Determines if an item belongs to the GitHub provider.
 * Both github and GitHub are accepted because the old strategy table exposes
 * aliases for both spellings.
 *
 * @param {object} item
 * The filesystem item.
 *
 * @returns {boolean}
 * True if the provider is GitHub.
 */
export function isGitHubWorld(item) {
  const type = getWorldType(item);
  return type === "github" || type === "GitHub";
}