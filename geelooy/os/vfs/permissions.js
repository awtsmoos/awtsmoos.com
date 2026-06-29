// B"H
export function canUseMount(mount, action = "read", context = {}) {
  const permissions = mount?.permissions || {};
  if (!mount) return denied("No VFS mount resolved", action);
  if (isDenied(permissions, action)) return denied("VFS mount permission denied", action, mount);
  if (!hasAllowRule(permissions, action)) return allowed(action, mount);
  return principalAllowed(permissions, action, context) ? allowed(action, mount) : denied("VFS principal not allowed", action, mount);
}

export function assertMountPermission(mount, action, context = {}) {
  const result = canUseMount(mount, action, context);
  if (!result.ok) throw Object.assign(new Error(result.error), { code:"VFS_PERMISSION_DENIED", result });
  return result;
}

function hasAllowRule(permissions, action) {
  return permissions[action] != null || permissions.allow != null;
}

function isDenied(permissions, action) {
  if (permissions[action] === false) return true;
  const deny = permissions.deny || permissions.denied || [];
  return listIncludes(deny, action) || deny[action] === true;
}

function principalAllowed(permissions, action, context) {
  const rule = permissions[action] ?? permissions.allow;
  if (rule === true) return true;
  if (Array.isArray(rule)) return rule.some(entry => principals(context).includes(entry));
  if (rule && typeof rule === "object") return principals(context).some(value => rule[value] === true);
  return Boolean(rule);
}

function principals(context = {}) {
  const explicit = [context.userId, context.role, context.sessionId].filter(Boolean).map(String);
  return explicit.length ? [...explicit, "*"] : ["current", "*"];
}

function listIncludes(value, action) {
  return Array.isArray(value) && value.includes(action);
}

function allowed(action, mount) {
  return { ok:true, action, mountId:mount.id, prefix:mount.prefix };
}

function denied(error, action, mount = {}) {
  return { ok:false, error, action, mountId:mount.id || "", prefix:mount.prefix || "" };
}

/**
 * B"H
 * The mount is a gate of speech. Most gates remain open until a keeper is named;
 * when a policy appears, this small chamber weighs the action without pulling
 * the whole VFS palace into itself. A stranger is not called current merely
 * because current exists; the gate listens to the offered name.
 */
