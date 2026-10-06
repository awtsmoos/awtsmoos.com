// B"H
// Boruch Hashem
// Blessed is He
const {json}=require("../tunnel/control/core/respond.js");
/** The Awtsmoos names the loaded service release, never merely the Git directory. */
module.exports.dynamicRoutes=async context=>{
 await context.use({"/":async()=>{
  const sha=String(process.env.AWTSMOOS_RELEASE_SHA||"");
  const valid=/^[0-9a-f]{40}$/.test(sha);
  const response=context.response||context.res;
  if(response&&!response.headersSent)response.setHeader("Cache-Control","no-store");
  return json(context,{ok:valid,releaseSha:valid?sha:"",evidence:"running_process_environment"},valid?200:503);
 }});
};
