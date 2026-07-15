// B"H
import { action } from './action.js';

/** B"H: mission actions turn receipts into memory instead of smoke. */
export const MISSION_ACTIONS = Object.freeze([
  action('missionAwareUse', 'Use active mission', 'Bind ordinary actions to one Mission OS id.', 'Mission', ['mission','receipt'], { missionId:'' }),
  action('missionAwareStatus', 'Mission-aware status', 'Show active Mission OS auto-receipt state.', 'Mission', ['mission','status'], {}),
  action('previewReceiptAttach', 'Attach preview receipt', 'Attach a live preview URL as Mission OS evidence.', 'Mission', ['receipt'], { needsMissionId:true, nodeId:'', url:'' }),
  action('missionStart', 'Start mission', 'Create a durable autonomous mission.', 'Mission', ['autopilot'], { needsMissionGoal:true }),
  action('missionAutopilot', 'Run mission autopilot', 'Advance several autonomous mission rounds with bounded receipts.', 'Mission', ['autopilot','bounded'], { needsMissionId:true, needsMissionAutopilot:true }),
  action('missionBrainstorm', 'Brainstorm mission', 'Expand the active mission from the supplied answer or constraint.', 'Mission', ['brainstorm','expansion'], { needsMissionId:true, needsMissionAutopilot:true }),
  action('missionCheckpoint', 'Checkpoint mission', 'Record a durable checkpoint note before more autonomous work.', 'Mission', ['checkpoint','receipt'], { needsMissionId:true, needsMissionNote:true }),
  action('missionSelfMailDraft', 'Draft mission mail', 'Prepare a mission progress email with the latest evidence.', 'Mission', ['mail','receipt'], { needsMissionId:true, needsMissionMail:true }),
  action('missionReport', 'Mission report', 'Load current mission status.', 'Mission', ['status'], { needsMissionId:true })
]);
