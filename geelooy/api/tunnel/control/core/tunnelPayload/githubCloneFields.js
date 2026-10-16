//B"H
//Boruch Hashem
//Blessed is He

"use strict";
/** Keep GitHub import fields across authenticated HTTP carriers, without
 *  accidentally exposing them to unrelated file or command actions.
 */
function fields(raw={},action="") {
	if(action!=="gitClone")return {};
	const url=raw.url||raw.repository;
	const destination=raw.destination||raw.path||raw.p;
	const ref=raw.ref||raw.branch||"main";
	return {
		...(typeof url==="string"?{url:url.slice(0,512)}:{}),
		...(typeof destination==="string"?{destination:destination.slice(0,1024)}:{}),
		...(typeof ref==="string"?{ref:ref.slice(0,150)}:{})
	};
}
module.exports={fields};
