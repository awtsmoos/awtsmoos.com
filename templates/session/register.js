<?Awtsmoos
// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives a new account a guarded name, salted password, and bounded session. */

function safeIpKey(request) {
	var raw = request.headers["x-forwarded-for"] || request.socket?.remoteAddress || request.connection?.remoteAddress || "unknown";
	return String(raw).split(",")[0].trim().replace(/[.$#[\]/:]/g, "_");
}

function cleanUsername(value) {
	var username = String(value || "").trim();
	if (!username) return { ok: false, message: "Please enter a username." };
	if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
	if (username.length > 32) return { ok: false, message: "Username must be 32 characters or less." };
	if (!/^[A-Za-z0-9_-]+$/.test(username)) return { ok: false, message: "Username can use letters, numbers, underscores, and dashes." };
	return { ok: true, username };
}

function cleanPassword(value) {
	var password = String(value || "");
	if (!password) return { ok: false, message: "Please enter a password." };
	if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
	if (password.length > 256) return { ok: false, message: "Password is too long." };
	return { ok: true, password };
}

async function getRegisterInfo(path) {
	var info = await db.get(path);
	if (!info || typeof info !== "object") info = {};
	info.registerAttempts = Number(info.registerAttempts) || 0;
	info.nextRegisterTime = Number(info.nextRegisterTime) || 0;
	info.registerCount = Number(info.registerCount) || 0;
	return info;
}

async function handleRegistration(request, post, secret) {
	if (!post || !post.username || !post.password) return { status: "neutral", message: "Please fill out the form to create an account." };
	var userCheck = cleanUsername(post.username);
	if (!userCheck.ok) return { status: "error", message: userCheck.message };
	var passCheck = cleanPassword(post.password);
	if (!passCheck.ok) return { status: "error", message: passCheck.message };
	var now = Date.now();
	var registerPath = "/ipAddresses/" + safeIpKey(request) + "/register";
	var info = await getRegisterInfo(registerPath);
	if (now < info.nextRegisterTime) return { status: "error", message: "Too many accounts were created from here. Try again later." };
	if (info.registerAttempts >= 5) {
		info.nextRegisterTime = now + 24 * 60 * 60 * 1000;
		info.registerAttempts = 0;
		await db.write(registerPath, info);
		return { status: "error", message: "Too many registration attempts. Please try again tomorrow." };
	}
	info.registerAttempts += 1;
	var accountPath = "/users/" + userCheck.username + "/account";
	if (await db.get(accountPath)) {
		await db.write(registerPath, info);
		return { status: "error", message: "That username already exists. Please choose another." };
	}
	var salt = sodos.generateSalt(16);
	await db.create(accountPath, { password: sodos.hashPassword(passCheck.password, salt), salt, createdAt: now });
	info.registerCount += 1;
	await db.write(registerPath, info);
	return {
		status: "success",
		message: "Successfully created new user!",
		token: sodos.createToken(userCheck.username, secret, sodos.createSessionMetadata(now), now),
		username: userCheck.username
	};
}

module.exports.handleRegistration = handleRegistration;
//?>
