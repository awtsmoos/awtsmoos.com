// B"H
/**
 * @module ContentAPI
 * @description
 * The Awtsmoos carries every Heichel and series identity through one encoded
 * gate. Hebrew letters, spaces, and friendly aliases therefore reach the
 * social API unchanged, while projected post reads use the backend's canonical
 * `properties` query contract.
 */

import { fetchData, postData, BASE_API_URL } from './core.js';

function segment(value) {
	return encodeURIComponent(String(value ?? ''));
}

export async function getPostDetails(heichelId, seriesId) {
	if (!seriesId || seriesId === 'root') return [];
	const properties = JSON.stringify({
		content: 256,
		title: true,
		postId: true,
		author: true,
		id: true,
		seriesId: true,
		parentSeriesId: true,
		indexInSeries: true
	});
	const params = new URLSearchParams({ properties });
	return fetchData(
		`${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}/posts/details?${params}`
	);
}

export async function getBreadcrumb(heichelId, seriesId) {
	if (!seriesId || seriesId === 'root') return [];
	const response = await fetchData(
		`${BASE_API_URL}heichelos/${segment(heichelId)}/series/${segment(seriesId)}/breadcrumb`
	);
	const trail = Array.isArray(response)
		? response
		: Array.isArray(response?.success)
			? response.success
			: [];
	return [...trail].reverse();
}

export async function deleteContent(data) {
	const { heichelId, aliasId, itemsToDelete } = data;
	const results = [];
	for (const item of itemsToDelete) {
		const parentId = segment(item.parentId);
		const itemId = segment(item.id);
		const reqUrl = item.type === 'post'
			? `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${parentId}/post/${itemId}/delete`
			: `${BASE_API_URL}heichelos/${segment(heichelId)}/series/${parentId}/deleteSubSeries/${itemId}`;
		const response = await postData(reqUrl, new URLSearchParams({ aliasId }));
		results.push({
			success: Boolean(response && (
				response.success
				|| response.ok
				|| typeof response.deletedCount !== 'undefined'
			)),
			item
		});
	}
	return results;
}

export function generateInputId(title) {
	if (!title) return `item-${Date.now()}`;
	const cleaned = title.replace(/[^a-zA-Z0-9\u0590-\u05FF\s-]/g, ' ').trim();
	const words = cleaned.split(/[\s-]+/).filter(Boolean);
	if (words.length === 0) return `item-${Date.now()}`;
	return words[0].toLowerCase()
		+ words.slice(1)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
}
