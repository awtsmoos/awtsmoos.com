// B"H
function pressure(next = {}, result = {}) {
  return { missionPressure:'high', releaseBlockedBecause:'unfinished mission continuation', currentBestMove:next.action || 'missionRoomSchedulerStatus',
    stoppingCost:['unfinished continuation token','unreviewed checkpoint','unresolved next tool call'],
    confidenceWarning: result.testsRun ? 'verification exists but release still needs mission approval' : 'verification evidence is still incomplete' };
}
/** B"H — The gate explains why continuing is the intelligent move. */
module.exports = { pressure };
