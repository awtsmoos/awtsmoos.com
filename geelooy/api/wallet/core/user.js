
// B"H

function currentUserId($i) {
  const user = $i.request?.user;
  return user?.info?.userId || user?.userId || user?.id || null;
}

function requireUser($i) {
  const userId = currentUserId($i);

  if (!userId) {
    return {
      ok: false,
      error: "login_required",
      loginUrl: "/login"
    };
  }

  return {
    ok: true,
    userId
  };
}

module.exports = {
  currentUserId,
  requireUser
};
