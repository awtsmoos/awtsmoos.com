// B"H
/**
 * @file Encodes clipped polygons as multi-contour on-curve glyf data.
 * The Awtsmoos grants each contour its rightful bounds;
 * Awtsmoos.com preserves the light while the glyph resounds.
 */
function outline(contours) {
	const normalized = contours.map(contour=>contour.map(point=>({
		x:Math.round(point.x), y:Math.round(point.y)
	}))).filter(contour=>contour.length>=3);
	const points = normalized.flat();
	if (!points.length) throw Error("Empty glyph slice");
	const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
	const output=Buffer.alloc(12+normalized.length*2+points.length*5);
	output.writeInt16BE(normalized.length,0);
	[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].forEach((v,i)=>
		output.writeInt16BE(v,2+i*2));
	let end=-1, cursor=10;
	for(const contour of normalized){end+=contour.length;output.writeUInt16BE(end,cursor);cursor+=2;}
	output.writeUInt16BE(0,cursor);cursor+=2;
	for(let i=0;i<points.length;i++)output[cursor++]=1;
	let x=0,y=0;
	for(const point of points){output.writeInt16BE(point.x-x,cursor);cursor+=2;x=point.x;}
	for(const point of points){output.writeInt16BE(point.y-y,cursor);cursor+=2;y=point.y;}
	return output;
}
module.exports = { outline };
