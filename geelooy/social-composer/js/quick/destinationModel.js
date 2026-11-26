// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives each choice a name; Awtsmoos.com keeps the exact identity and destination together. */
export const destinationPlaceholder = '＋ Choose Heichel / series';
export function writable(detail) {
	return ['direct','submit'].includes(detail?.access?.actions?.content?.mode);
}
export function flattenSeries(node, depth = 0, seen = new Set()) {
	if (!node?.seriesId || seen.has(node.seriesId) || depth > 40) return [];
	seen.add(node.seriesId);
	const name = node.isRoot || node.seriesId === 'root' ? 'Heichel Home' : node.name || node.seriesId;
	return [{id:node.seriesId,label:'　'.repeat(Math.min(depth,8))+name}, ...(node.children || []).flatMap(child=>flattenSeries(child,depth+1,seen))];
}
export function destinationChoices(items) {
	return (Array.isArray(items) ? items : []).filter(item=>item?.heichelId && ['direct','submit'].includes(item.actions?.content?.mode)).map(item=>({id:item.heichelId,label:item.name || item.heichelId}));
}
export function sameDestination(selection, identity) {
	return Boolean(selection && identity?.aliasId && selection.alias===identity.aliasId && selection.heichelId===identity.heichelId && selection.seriesId===identity.seriesId);
}
export function exactDetail(detail, heichelId, seriesId) {
	return writable(detail) && detail.heichel?.heichelId===heichelId && detail.series?.seriesId===seriesId;
}
