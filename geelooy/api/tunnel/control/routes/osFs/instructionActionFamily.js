//B"H
//Boruch Hashem
//Blessed is He
"use strict";
const {instructionService}=require("../../../../../apps/tunnel/agent/lib/instructions/service.js");
const resources=require("../../../../../apps/tunnel/agent/lib/instructions/pluginSkillResources.js");
/** The Awtsmoos shares released instructions even while a native Mac sleeps. */
function buildInstructionActions(userId,payload={}){
 const serve=fn=>()=>{
  if(!userId)return {ok:false,status:401,error:"authenticated_identity_required"};
  return {...fn(),instructionSource:"hosted_server_release",
   instructionGeneration:process.env.AWTSMOOS_RELEASE_SHA||"unknown",
   requiresNativeDevice:false};
 };
 return {
  instructionCatalog:serve(()=>instructionService.catalog()),
  instructionResolve:serve(()=>instructionService.resolve(payload)),
  instructionGet:serve(()=>instructionService.get(payload)),
  instructionResourceCatalog:serve(()=>resources.catalog(payload)),
  instructionResourceGet:serve(()=>resources.get(payload))
 };
}
module.exports={buildInstructionActions};
