// B"H
export const SIMULATION_TIERS=Object.freeze({direct:{radius:60,hz:30,mode:'full'},visible:{radius:160,hz:10,mode:'behavior'},region:{radius:420,hz:1,mode:'statistical'},far:{radius:Infinity,hz:.05,mode:'summary'}});
export function simulationTier(distance=0){for(const [name,tier]of Object.entries(SIMULATION_TIERS))if(distance<=tier.radius)return{name,...tier};return{name:'far',...SIMULATION_TIERS.far}}
export default {SIMULATION_TIERS,simulationTier};
