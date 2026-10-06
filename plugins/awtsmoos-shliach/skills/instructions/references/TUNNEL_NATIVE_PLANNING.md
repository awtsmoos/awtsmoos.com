<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Plans belong to the tunnel

Read bootstrap.missionPlanning and current action schemas. Inspect missionVisibilityList and tunnelPlanList.
Resume the correct mission/plan by returned identifiers, account/project/root and objective. Never choose an
unrelated active mission simply because it is newest. Register only when no matching mission exists.

Current planning defaults:
- missionVisibilityRegister: title, description, optional canonical missionId; retain returned id.
- missionVisibilityPlanningPass: id or missionId, pass 1/2/3, title, summary, content, sourcePaths.
- missionVisibilityReport: discovered milestone kind, summary, evidence, paths, blockers and next actions.
- tunnelPlanCreate: title, summary, projectRoot, missionId, phases with phaseId/title/status/summary/items.
- items use itemId/text/done/note. Retain returned plan.planId and version.
- tunnelPlanGet/List: inspect current state before update.
- tunnelPlanPhaseAdd/PhaseSet: add work or update phase status/summary without replacing the plan identity.
- tunnelPlanChecklistSet: planId, phaseId, itemId, done and note; mark done only with evidence.
- tunnelPlanPromptAdd: planId and text/prompt; append a new requirement, correction or decision.
- tunnelPlanUpdate: update title, summary, labels/status and mission linkage; do not overwrite another agent.
- tunnelPlanHtml: return a readable plan; use actual public links only when the service returns them.

These are verified handler contracts at authoring time, not a substitute for the live schema.
Pass structured fields through the generic MCP params object. Never wrap another action in params.action.
Unknown fields must survive transport; inspect the action echo/schema if the server rejects a valid payload.
Plan mutations require tunnel.write. Mission coordination uses its current room/mission permissions.

Three operational passes:
1. Possibilities: objective, context, ideas, options, knowns, unknowns and constraints.
2. Design: exact files, interfaces, dependencies, alternatives, selected approach, risks and tests.
3. Execution: refined checklist, acceptance criteria, ownership, concurrency, rollback and receipt handling.
Use prose, lists or rendered graphs when useful. Store finite public planning artifacts, not private reasoning.
Keep big imagination separate from the authorized implementation. Every proposed scope expansion is labeled.

After work: compare requested/planned/implemented/verified/remaining. Publish milestones and blockers
as they happen. Add new phases/prompts rather than silently erasing prior decisions. Reconcile registry
version and actual files on resumption. Keep deployment source SHA and live evidence distinct.
Only use a local archive when the tunnel asks for it, the user requests it, or a registry failure makes a
necessary checkpoint otherwise impossible. Report the fallback and later link/import it into the registry.
