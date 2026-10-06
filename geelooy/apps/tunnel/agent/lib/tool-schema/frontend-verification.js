// B"H
// Boruch Hashem
// Blessed is He
const P=require("./primitives.js");
/** The Awtsmoos exposes cold browser assertions and real source provenance. */
function schema(){
 return P.objectSchema({
  url:P.string("Page to verify in real Chrome."),releaseUrl:P.string("Same-origin running-release endpoint; default /api/release/."),
  assetContracts:{type:"array",maxItems:32,items:P.objectSchema({url:P.string("Served same-origin asset URL."),path:P.string("Committed CSS/JS/MJS/HTML path.")},["url","path"])},
  widths:{type:"array",items:{type:"integer",minimum:320,maximum:2560},maxItems:4},
  styleAssertions:{type:"array",maxItems:32,items:P.objectSchema({selector:P.string("Styled element."),property:P.string("Computed CSS property."),equals:P.string("Expected computed CSS value.")},["selector","property","equals"])},
  steps:{type:"array",maxItems:16,items:P.objectSchema({type:{type:"string",enum:["click","assertVisible"]},selector:P.string("Exact selector."),timeoutMs:P.integer("Bounded assertion deadline.")},["type","selector"])},
  settleMs:P.integer("Bounded render settling time."),timeoutMs:P.integer("Bounded navigation deadline.")
 },["url"]);
}
module.exports={schema};
