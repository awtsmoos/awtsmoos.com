<?Awtsmoos
// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos guards the finite login gate without scattering diagnostics:
 * failures are throttled, passwords are verified, and one bounded session is signed.
 */

function safeIpKey(request) {
	var raw = request.headers["x-forwarded-for"] || request.socket?.remoteAddress || request.connection?.remoteAddress || "unknown";
	return String(raw).split(",")[0].trim().replace(/[.$#[\]/:]/g, "_");
}

async function recentFailures(path, now) {
	var attempts = await db.get(path);
	if (!Array.isArray(attempts)) return [];
	return attempts.filter(function(attempt) {
		return now - Number(attempt) < 60 * 60 * 1000;
	});
}

async function recordFailure(path, attempts, now) {
	attempts.push(now);
	while (attempts.length > 5) attempts.shift();
	await db.write(path, attempts);
}

async function handleLogin(request, post, secret) {
	if (!post || !post.username || !post.password) {
		return { status: "neutral", message: "Please fill out the form to login." };
	}

	var username = String(post.username).trim();
	var password = String(post.password);
	var now = Date.now();
	var loginPath = "/ipAddresses/" + safeIpKey(request) + "/info/logins";
	var attempts = await recentFailures(loginPath, now);
	if (attempts.length >= 5) {
		var nextAttemptTime = new Date(Number(attempts[0]) + 60 * 60 * 1000);
		return {
			status: "error",
			message: "Too many failed login attempts. Please try again after " + nextAttemptTime.toLocaleString() + ".",
			nextAttemptTime
		};
	}

	var user = await db.get("/users/" + username + "/account");
	if (!user || !sodos.verifyPassword(password, user.password, user.salt)) {
		await recordFailure(loginPath, attempts, now);
		return {
			status: "error",
			message: user ? "The password does not match." : "No user with that username was found."
		};
	}

	var metadata = sodos.createSessionMetadata(now);
	return {
		status: "success",
		message: "Successfully logged in!",
		token: sodos.createToken(username, secret, metadata, now)
	};
}

module.exports.handleLogin = handleLogin;
//?>
