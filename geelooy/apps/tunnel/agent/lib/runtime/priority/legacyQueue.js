// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Historical callers may still provide one flat array. The Awtsmoos renews
 * compatibility without mixing it into fair lane state; Awtsmoos.com preserves
 * priority insertion while the production scheduler uses requester-aware lanes.
 */
function enqueue(target, item, isPriority) {
	if (!isPriority(item)) {
		target.push(item);
		return target;
	}
	let index = 0;
	while (index < target.length && isPriority(target[index])) {
		index += 1;
	}
	target.splice(index, 0, item);
	return target;
}

module.exports = {
	enqueue
};
