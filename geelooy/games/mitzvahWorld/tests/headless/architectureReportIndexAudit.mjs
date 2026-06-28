// B"H
/** ArchitectureReportIndexAudit: every report receives a doorway and what it proves. */
import fs from 'node:fs';
const reports=[
 ['latest_import_graph.json','Import graph, roots, reachability, domains.'],
 ['latest_runtime_ownership_graph.json','Owner chain and ownerless claim status.'],
 ['latest_system_boundary_audit.json','Critical and monitored boundary crossings.'],
 ['latest_boundary_crossing_review.json','Review decisions for monitored crossings.'],
 ['latest_unreachable_breakdown.json','Static unreachable bucket breakdown.'],
 ['latest_dead_abstraction_review.json','Grouped one-use abstraction candidates.'],
 ['latest_state_mutation_hotspot_review.json','Top mutation/global/localStorage hotspots.'],
 ['latest_top_debt_investigation.json','Feature49/Feature100/AnimalRuntime debt evidence.'],
 ['latest_feature_maturity_index.json','Per-feature maturity score.'],
 ['latest_browser_evidence_tiers.json','Browser proof tier ladder.'],
 ['latest_deletion_confidence.json','Per-file deletion confidence and blockers.'],
 ['latest_technical_debt_ranking.json','Risk/reach/importance priority ranking.'],
 ['latest_dependency_instability.json','Fan-in/fan-out instability.'],
 ['latest_event_propagation_graph.json','Named event ownership path.'],
 ['latest_state_mutation_audit.json','Lexical state mutation/global touch scan.'],
 ['latest_temporal_dependency_audit.json','Static intended boot order.'],
 ['latest_removal_blast_radius.json','Direct importer blast radius for candidates.'],
 ['latest_architecture_regression_snapshot.json','Latest metrics snapshot.'],
 ['latest_architecture_regression_compare.json','Latest-vs-previous snapshot diff.'],
 ['latest_architecture_health_dashboard.json','Rollup health metrics.'],
 ['latest_final_architecture_readback.json','Proven vs unproven final readback.']
].map(([name,proves])=>({path:`AI_THOUGHTS/architecture_reports/${name}`,exists:fs.existsSync(`AI_THOUGHTS/architecture_reports/${name}`),proves}));
const report={ok:reports.filter(r=>!r.exists && !r.path.endsWith('latest_final_architecture_readback.json')).length===0,reports};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_architecture_report_index.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,total:reports.length,missing:reports.filter(r=>!r.exists).map(r=>r.path)},null,2));
