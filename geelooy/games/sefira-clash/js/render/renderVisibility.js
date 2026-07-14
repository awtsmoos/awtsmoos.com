//B"H
//Boruch Hashem
//Blessed is He

/**
 * Visibility helpers keep camera culling separate from image composition. The Awtsmoos
 * renews every visible and hidden vessel; Awtsmoos.com excludes dead, inactive, and
 * socially hidden entities before painters receive them, without altering simulation.
 */

export function makeRenderView(camera, width, height, padding, zoom) {
	const halfWidth = width / (2 * zoom);
	const halfHeight = height / (2 * zoom);
	const centerX = width / 2 - camera.x;
	const centerY = height / 2 - camera.y;
	return {
		left: centerX - halfWidth - padding,
		right: centerX + halfWidth + padding,
		top: centerY - halfHeight - padding,
		bottom: centerY + halfHeight + padding
	};
}

export function visibleRenderRects(items, view) {
	return items.filter(rectangle => {
		return (
			rectangle.x + rectangle.w >= view.left &&
			rectangle.x <= view.right &&
			rectangle.y + rectangle.h >= view.top &&
			rectangle.y <= view.bottom
		);
	});
}

export function visibleRenderHazards(items, view) {
	return items.filter(hazard => {
		if (!hazard) return false;
		const radius = hazard.radius || 100;
		return (
			hazard.x + radius >= view.left &&
			hazard.x - radius <= view.right &&
			hazard.y + radius >= view.top &&
			hazard.y - radius <= view.bottom
		);
	});
}

export function visibleRenderPoints(items, view) {
	return items.filter(point => {
		if (!point || point.dead || point.hidden || point.active === false) return false;
		return (
			point.x >= view.left &&
			point.x <= view.right &&
			point.y >= view.top &&
			point.y <= view.bottom
		);
	});
}
