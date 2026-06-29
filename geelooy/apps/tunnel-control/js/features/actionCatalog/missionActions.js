// B"H
import { action } from './action.js';

/** B"H: mission actions turn receipts into memory instead of smoke. */
export const MISSION_ACTIONS = Object.freeze([
  action('missionAwareUse', 'Use active mission', 'Bind ordinary actions to one Mission OS id.', 'Mission', ['mission','receipt'], { missionId:'' }),
  action('missionAwareStatus', 'Mission-aware status', 'Show active Mission OS auto-receipt state.', 'Mission', ['mission','status'], {}),
  action('previewReceiptAttach', 'Attach preview receipt', 'Attach a live preview URL as Mission OS evidence.', 'Mission', ['receipt'], { needsMissionId:true, nodeId:'', url:'' }),
  action('missionStart', 'Start mission', 'Create a durable autonomous mission.', 'Mission', ['autopilot'], { needsMissionGoal:true }),
  action('missionReport', 'Mission report', 'Load current mission status.', 'Mission', ['status'], { needsMissionId:true })
]);
