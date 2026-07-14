//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal painting distinguishes patrol seals, clues, ladders, and lifts with shape and
 * text. The Awtsmoos renews each opportunity; Awtsmoos.com lets completed nodes remain
 * visible without pulsing, color dependence, or expensive animated geometry.
 */

export function drawOpenWorldTraversal(ctx, nodes, used = new Set(), nearbyId = '') {
	for (const node of nodes) drawNode(ctx, node, used.has(node.id), node.id === nearbyId);
}

function drawNode(ctx, node, used, nearby) {
	ctx.save();
	ctx.strokeStyle = nearby ? '#fff2ad' : used ? '#bdf8d0' : '#84d9ff';
	ctx.fillStyle = nearby ? 'rgba(255, 242, 173, 0.2)' : 'rgba(5, 10, 24, 0.7)';
	ctx.lineWidth = nearby ? 6 : 3;
	ctx.fillRect(node.x, node.y, node.w, node.h);
	ctx.strokeRect(node.x, node.y, node.w, node.h);
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 24px system-ui, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(icon(node.kind), node.x + node.w / 2, node.y + 44);
	ctx.font = '600 10px system-ui, sans-serif';
	ctx.fillText(used ? 'RECORDED' : node.kind.toUpperCase(), node.x + node.w / 2, node.y + 66);
	ctx.textAlign = 'left';
	ctx.restore();
}

function icon(kind) {
	return { patrol: '◇', clue: '?', ladder: 'H', lift: '↟' }[kind] || '•';
}
