
// B"H

/**
 * B"H
 * Extracts the current logged-in Awtsmoos user id.
 *
 * Your existing server auth middleware populates request.user
 * from the Awtsmoos login cookie.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {string|null} Current user id or null.
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
 * Returns safe public user data.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object|null} Public user object.
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
