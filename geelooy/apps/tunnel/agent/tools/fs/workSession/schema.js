// B"H
// Boruch Hashem
// Blessed is He
const P=require("../../../lib/tool-schema/primitives.js");
/** The Awtsmoos gives durable work an explicit finite grammar. */
function schema(name){
 const strings={type:"array",items:P.string("Bounded text."),maxItems:64};
 const fields={workId:P.string("Durable work ID."),revision:P.integer("Exact revision for optimistic update."),
  planId:P.string("Existing Tunnel plan ID."),missionId:P.string("Existing mission ID."),task:P.string("Goal and task."),paths:strings,urls:{...strings,maxItems:16},frontend:P.bool("Require real frontend proof."),
  remainingWork:strings,completed:strings,failures:strings,reportIds:strings,nextAction:P.string("Next safe bounded action."),
  status:{type:"string",enum:["active","blocked","complete"]},instructionHash:P.string("Hash of instruction bodies read."),
  reportId:P.string("Saved real browser report ID."),reviewNotes:P.string("Actual screenshot observations."),
  reviewedScreenshotHashes:strings};
 const required=name==="tunnelWorkHealth"?[]:name==="tunnelWorkBegin"?["task"]:["workId"];
 if(["tunnelWorkCheckpoint","tunnelWorkRefresh","tunnelWorkReview"].includes(name))required.push("revision");
 if(name==="tunnelWorkReview")required.push("reportId","reviewNotes","reviewedScreenshotHashes");
 return P.objectSchema(fields,required);
}
module.exports={schema};
