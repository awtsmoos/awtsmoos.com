/** B"H — tiny shell over split direct AI modules. */
import { botCommand } from './direct/command.js';
export function driveBots(state){
 for(const bot of state.fighters){
  if(bot.human||bot.dead||bot.hidden||bot.respawnTimer)continue;
  bot.input=botCommand(bot,state);
 }
}
