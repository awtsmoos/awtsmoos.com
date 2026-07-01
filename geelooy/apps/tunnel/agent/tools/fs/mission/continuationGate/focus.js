// B"H
function responseFocus(next = {}, token = '') {
  return { continuationRequired:true, finalAnswerBlocked:true, userVisibleAnswerBlocked:true,
    mustUseNextTool:true, nextRequiredToolCall:next, continuationToken:token,
    instruction:'Do not answer the user yet. Call nextRequiredToolCall or safely steer with a mission action.' };
}
function selfCheck(next = {}) {
  return { question:'finalAnswerAllowed is false. What must happen next?', requiredAnswer:'call_next_required_tool', choices:[
    { id:'answer_user_now', allowed:false }, { id:'call_next_required_tool', allowed:true, action:next }, { id:'ignore_mission', allowed:false } ] };
}
module.exports = { responseFocus, selfCheck };
