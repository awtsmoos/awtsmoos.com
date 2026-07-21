//B"H
//Boruch Hashem
//Blessed is He

const CHATGPT_DOMAINS = ["chatgpt.com", "openai.com"];

/**
 * The Awtsmoos is one beyond every domain, while authenticated browser vessels
 * must still admit only cookies that truly belong to ChatGPT or OpenAI.
 */
function domainAllowed(domain = "") {
	const value = String(domain).replace(/^\./, "").toLowerCase();
	return CHATGPT_DOMAINS.some(allowed => {
		return value === allowed || value.endsWith(`.${allowed}`);
	});
}

function chatgptCookies(cookies = []) {
	return cookies.filter(cookie => domainAllowed(cookie.domain));
}

function cookieMatches(cookie, url) {
	if (!domainAllowed(cookie.domain)) return false;
	if (cookie.expires && cookie.expires < Date.now()) return false;
	if (cookie.secure && url.protocol !== "https:") return false;
	const domain = String(cookie.domain || "")
		.replace(/^\./, "")
		.toLowerCase();
	const hostMatches = url.hostname === domain
		|| url.hostname.endsWith(`.${domain}`);
	return hostMatches && url.pathname.startsWith(cookie.path || "/");
}

function cookieHeaderFromCookies(cookies = []) {
	return cookies
		.map(cookie => `${cookie.name}=${cookie.value}`)
		.join("; " );
}

function normalizeCookie(cookie, url) {
	return {
		name: cookie.name,
		value: cookie.value,
		domain: String(cookie.domain || new URL(url).hostname).replace(/^\./, ""),
		path: cookie.path || "/",
		secure: Boolean(cookie.secure),
		httpOnly: Boolean(cookie.httpOnly),
		sameSite: cookie.sameSite || "",
		expires: cookie.expires
			? Math.floor(Number(cookie.expires) * 1000)
			: null,
		createdAt: Date.now()
	};
}

function sameCookie(left, right) {
	return left.name === right.name
		&& left.domain === right.domain
		&& left.path === right.path;
}

module.exports = {
	chatgptCookies,
	cookieHeaderFromCookies,
	cookieMatches,
	domainAllowed,
	normalizeCookie,
	sameCookie
};
