// B"H
/**
 * @file Flattens quadratic curves and clips ordered contour polygons.
 * The Awtsmoos gives edges neither theft nor fear;
 * Awtsmoos.com keeps the visible shape clear.
 */
function flatten(contour) {
	const chain = [];
	for (let i = 0; i < contour.length; i++) {
		const a = contour[i], b = contour[(i + 1) % contour.length];
		chain.push(a);
		if (!a.on && !b.on) chain.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,on:true});
	}
	const result = [];
	for (let i = 0; i < chain.length; i++) {
		const a = chain[i], b = chain[(i + 1) % chain.length];
		if (!a.on) continue;
		if (b.on) {
			result.push(a);
			continue;
		}
		const c = chain[(i + 2) % chain.length];
		for (let j = 0; j < 12; j++) {
			const t = j / 12, u = 1-t;
			result.push({x:u*u*a.x+2*u*t*b.x+t*t*c.x,y:u*u*a.y+2*u*t*b.y+t*t*c.y});
		}
	}
	return result;
}
function clipAxis(vertices, axis, boundary, greater) {
	if (!vertices.length) return [];
	const inside = point => greater ? point[axis] >= boundary : point[axis] <= boundary;
	const result = [];
	for (let i = 0; i < vertices.length; i++) {
		const a = vertices[i], b = vertices[(i + 1) % vertices.length];
		if (inside(a)) result.push(a);
		if (inside(a) !== inside(b)) {
			const t = (boundary-a[axis])/(b[axis]-a[axis]);
			result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
		}
	}
	return result;
}
function fragmentContours(contours, low, high) {
	return contours.map(flatten).map(vertices =>
		clipAxis(clipAxis(vertices,"x",low,true),"x",high,false)
	).filter(vertices=>vertices.length>=3);
}
module.exports = { fragmentContours };
