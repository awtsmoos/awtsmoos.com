// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos distinguishes recorded claims, rendered evidence, and release proof. */
function evaluate(session, repo, reports = [], now = Date.now()) {
 const reasons=[];
 if(!repo.ok)reasons.push("repository_unavailable");
 if(!repo.clean)reasons.push("repository_dirty");
 if(repo.commit!==session.commit)reasons.push("repository_commit_changed");
 if(!session.instructions?.ready)reasons.push("server_instructions_unavailable");
 if(!session.instructions?.acknowledged)reasons.push("instructions_not_acknowledged");
 if(session.status==="blocked")reasons.push("session_blocked");
 if(session.remainingWork?.length)reasons.push("remaining_work");
 if(session.nextAction)reasons.push("next_action_remaining");
 if(!session.completed?.length)reasons.push("no_completed_work");
 if(session.frontend){
  for(const url of session.urls||[]){
   const matches=reports.filter(r=>r.url===url&&r.commit===repo.commit&&r.source==="real-chrome");
   const evidence=matches.find(r=>r.ok&&r.commitVerified&&r.interactionVerified&&r.styleAssertionsVerified&&r.samples?.some(s=>s.width<=390)&&r.samples?.some(s=>s.width>=1280)&&r.samples.every(s=>s.screenshotSha256));
   if(!evidence)reasons.push("frontend_evidence_missing:"+url);
   else if(!session.reviews?.[evidence.id]||session.reviews[evidence.id].hashes.join(",")!==evidence.samples.map(s=>s.screenshotSha256).join(","))reasons.push("visual_review_missing:"+url);
   else if(!Number.isFinite(Date.parse(evidence.createdAt))||now<Date.parse(evidence.createdAt)-5000||now-Date.parse(evidence.createdAt)>3600000)reasons.push("frontend_evidence_stale:"+url);
  }
  if(!session.urls?.length)reasons.push("frontend_urls_missing");
 }
 return {ok:reasons.length===0,releaseReady:reasons.length===0,reasons,evidenceLevel:"stored_real_browser_reports",commit:repo.commit};
}
module.exports={evaluate};
