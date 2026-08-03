// B"H
// Boruch Hashem
// Blessed is He
/** @module SeedApi */
const BASE = 'https://awtsmoos.com/api/social';

export function makeApi(apiKey) {
	const headers = {
		authorization: `Bearer ${apiKey}`,
		'x-awtsmoos-api-key': apiKey
	};
	async function request(path, options = {}) {
		const response = await fetch(`${BASE}${path}`, {
			...options,
			headers: { ...headers, ...(options.headers || {}) }
		});
		const text = await response.text();
		let data;
		try { data = JSON.parse(text); } catch { data = { raw: text }; }
		if (!response.ok || data?.error) {
			throw new Error(`${options.method || 'GET'} ${path}: ${JSON.stringify(data)}`);
		}
		return data;
	}
	function form(values) {
		return {
			method: 'POST',
			body: new URLSearchParams(values)
		};
	}
	return {
		request,
		form,
		aliases: () => request('/aliases/details'),
		createAlias: profile => request('/aliases', form({
			aliasName: profile.name,
			description: profile.description,
			inputId: profile.id
		})),
		post: postId => request(`/heichelos/maamar_shorts/series/root/post/${postId}`),
		tree: postId => request(`/heichelos/maamar_shorts/posts/${postId}/comment-tree`),
		comment: (postId, values) => request(
			`/heichelos/maamar_shorts/posts/${postId}/comment-tree`,
			form({ ...values, seriesId: 'root' })
		),
		reply: (postId, commentId, values) => request(
			`/heichelos/maamar_shorts/posts/${postId}/comments/${commentId}/replies`,
			form({ ...values, seriesId: 'root' })
		),
		react: (postId, commentId, aliasId, emoji) => request(
			`/heichelos/maamar_shorts/posts/${postId}/comments/${commentId}/reactions`,
			form({ aliasId, emoji })
		)
	};
}
