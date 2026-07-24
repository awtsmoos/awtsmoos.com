//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos hides sensitive values while revealing capability shapes. This
 * Awtsmoos.com expression records status, types, and browser vessels only; it
 * never returns access tokens, challenge payloads, proof values, or account ids.
 */
export class RouteCapabilityExpression {
	build() {
		return `(async () => {
			const sessionResponse = await fetch('/api/auth/session', {
				credentials: 'include', cache: 'no-store'
			});
			const sessionText = await sessionResponse.text();
			let session = {};
			try { session = JSON.parse(sessionText); } catch {}
			const token = session.accessToken;
			const accountId = session.account?.id || session.user?.account_id || session.user?.id;
			const headers = { 'Content-Type': 'application/json' };
			if (typeof token === 'string') headers.Authorization = 'Bearer ' + token;
			if (typeof accountId === 'string') headers['ChatGPT-Account-ID'] = accountId;

			async function inspect(pathname) {
				try {
					const response = await fetch(pathname, {
						method: 'POST', headers, credentials: 'include', cache: 'no-store'
					});
					const text = await response.text();
					let value = null;
					try { value = JSON.parse(text); } catch {}
					return {
						status: response.status,
						contentType: response.headers.get('content-type'),
						textLength: text.length,
						jsonKeys: value && typeof value === 'object' ? Object.keys(value) : [],
						shape: value && typeof value === 'object'
							? Object.fromEntries(Object.entries(value).map(([key, child]) => [
								key, Array.isArray(child) ? 'array' : child === null ? 'null' : typeof child
							]))
							: null,
						detailFields: Array.isArray(value?.detail)
							? value.detail.map(item => ({ loc: item.loc, type: item.type })).slice(0, 12)
							: []
					};
				} catch (error) {
					return { error: String(error).slice(0, 160) };
				}
			}

			const registrations = navigator.serviceWorker
				? await navigator.serviceWorker.getRegistrations().catch(() => [])
				: [];
			const scriptPaths = [...document.scripts]
				.map(script => {
					try { return new URL(script.src).pathname; } catch { return ''; }
				})
				.filter(Boolean)
				.slice(0, 40);
			const globalNames = Object.getOwnPropertyNames(globalThis)
				.filter(name => /conversation|sentinel|proof|turnstile|challenge|prepare/i.test(name))
				.slice(0, 80);

			return {
				title: document.title,
				url: location.href,
				readyState: document.readyState,
				challenge: /just a moment/i.test(document.title),
				authenticated: sessionResponse.status === 200
					&& Boolean(session.user)
					&& typeof token === 'string',
				session: {
					status: sessionResponse.status,
					contentType: sessionResponse.headers.get('content-type'),
					keys: Object.keys(session),
					hasAccessToken: typeof token === 'string' && token.length > 0,
					hasAccountId: typeof accountId === 'string' && accountId.length > 0
				},
				scripts: { count: document.scripts.length, paths: scriptPaths },
				serviceWorker: {
					controlled: Boolean(navigator.serviceWorker?.controller),
					registrationCount: registrations.length
				},
				topicSocket: {
					seen: Boolean(globalThis.__awtsmoosRouteSocket),
					open: globalThis.__awtsmoosRouteSocket?.readyState === WebSocket.OPEN
				},
				extension: {
					bridge: typeof globalThis.awtsmoosFetch === 'function',
					directChat: typeof globalThis.awtsmoosFetch?.directChat === 'function'
				},
				globalNames,
				conversationPrepare: await inspect('/backend-api/f/conversation/prepare'),
				sentinelPrepare: await inspect('/backend-api/sentinel/chat-requirements/prepare')
			};
		})()`;
	}
}
