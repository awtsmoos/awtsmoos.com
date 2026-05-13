
// B"H

/**
 * B"H
 * Extracts the logged-in Awtsmoos user id from the existing server session.
 * The cookie already did its hidden work; this only reads the revealed result.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {string|null} User id or null.
 */
function getUserId($i) {
  return (
    $i.request.user?.info?.userId ||
    $i.request.user?.userId ||
    $i.request.user?.id ||
    null
  );
}

/**
 * B"H
 * Returns a safe public view of the current user.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object|null} Public user info.
 */
function publicUser($i) {
  const user = $i.request.user;
  const userId = getUserId($i);

  if (!userId) return null;

  return {
    userId,
    username: user?.info?.username || user?.username || null,
    displayName: user?.info?.displayName || user?.displayName || null
  };
}

module.exports = { getUserId, publicUser };
