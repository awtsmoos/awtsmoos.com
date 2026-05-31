<?Awtsmoos
// B"H

/**
 * B"H
 * Chapter 3: The Name-Vessel at the Second Gate.
 *
 * Registration is the moment a new account name descends from possibility into
 * a stored vessel. The Awtsmoos has no body and no form, yet every username is
 * a finite container in the database; therefore this handler guards the name,
 * rate limit, password salt, and token without trusting loose paths or stale
 * globals.
 */

/**
 * Makes an IP safe for a DosDB path.
 *
 * @param {object} request Incoming request.
 * @returns {string} Safe IP-ish key.
 */
function safeIpKey(request) {
  var raw =
    request.headers["x-forwarded-for"] ||
    request.socket?.remoteAddress ||
    request.connection?.remoteAddress ||
    "unknown";

  return String(raw).split(",")[0].trim().replace(/[.$#[\]/:]/g, "_");
}

/**
 * Normalizes and validates account names.
 *
 * @param {unknown} value Raw username.
 * @returns {{ok:boolean, username?:string, message?:string}} Result.
 */
function cleanUsername(value) {
  var username = String(value || "").trim();

  if (!username) return { ok: false, message: "Please enter a username." };
  if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
  if (username.length > 32) return { ok: false, message: "Username must be 32 characters or less." };
  if (!/^[A-Za-z0-9_-]+$/.test(username)) {
    return { ok: false, message: "Username can use letters, numbers, underscores, and dashes." };
  }

  return { ok: true, username };
}

/**
 * Validates password shape before the database is touched.
 *
 * @param {unknown} value Raw password.
 * @returns {{ok:boolean, password?:string, message?:string}} Result.
 */
function cleanPassword(value) {
  var password = String(value || "");

  if (!password) return { ok: false, message: "Please enter a password." };
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  if (password.length > 256) return { ok: false, message: "Password is too long." };

  return { ok: true, password };
}

/**
 * Reads and repairs the registration throttle record.
 *
 * @param {string} path DosDB rate path.
 * @returns {Promise<object>} Mutable rate record.
 */
async function getRegisterInfo(path) {
  var info = await db.get(path);
  if (!info || typeof info !== "object") info = {};

  info.registerAttempts = Number(info.registerAttempts) || 0;
  info.nextRegisterTime = Number(info.nextRegisterTime) || 0;
  info.registerCount = Number(info.registerCount) || 0;
  return info;
}

/**
 * Handles new user registration.
 *
 * @param {object} request Incoming HTTP request.
 * @param {object} post Parsed POST values.
 * @param {string} secret Token secret.
 * @returns {Promise<object>} Registration result.
 */
async function handleRegistration(request, post, secret) {
  if (!post || !post.username || !post.password) {
    return { status: "neutral", message: "Please fill out the form to create an account." };
  }

  var userCheck = cleanUsername(post.username);
  if (!userCheck.ok) return { status: "error", message: userCheck.message };

  var passCheck = cleanPassword(post.password);
  if (!passCheck.ok) return { status: "error", message: passCheck.message };

  var username = userCheck.username;
  var password = passCheck.password;
  var ip = safeIpKey(request);
  var registerPath = "/ipAddresses/" + ip + "/register";
  var info = await getRegisterInfo(registerPath);
  var now = Date.now();

  if (now < info.nextRegisterTime) {
    return {
      status: "error",
      message: "Too many accounts were created from here. Try again after " + new Date(info.nextRegisterTime).toLocaleString() + "."
    };
  }

  if (info.registerAttempts >= 5) {
    info.nextRegisterTime = now + 24 * 60 * 60 * 1000;
    info.registerAttempts = 0;
    await db.write(registerPath, info);
    return {
      status: "error",
      message: "Too many registration attempts. Please try again tomorrow."
    };
  }

  info.registerAttempts += 1;

  var accountPath = "/users/" + username + "/account";
  var existing = await db.get(accountPath);
  if (existing) {
    await db.write(registerPath, info);
    return { status: "error", message: "That username already exists. Please choose another." };
  }

  var salt = sodos.generateSalt(16);
  var passwordHash = sodos.hashPassword(password, salt);
  var token = sodos.createToken(username, secret);

  await db.create(accountPath, {
    password: passwordHash,
    salt,
    createdAt: now
  });

  info.registerCount += 1;
  await db.write(registerPath, info);

  return {
    status: "success",
    message: "Successfully created new user!",
    token,
    username
  };
}

module.exports.handleRegistration = handleRegistration;
//?>
