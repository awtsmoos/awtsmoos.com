// B"H
/** Animation buttons: every clip becomes a ready-to-tap gate in time. */
export function mountAnimationButtons({host,select,player,onChange}){
  host.innerHTML='';const buttons=[];for(const [i,name] of player.names.entries()){const b=document.createElement('button');b.type='button';b.className='clipButton';b.textContent=label(name);b.title=name;b.onclick=()=>{player.play(i);if(select)select.value=String(i);sync();onChange?.(player.current);};host.appendChild(b);buttons.push(b);}function sync(){for(const [i,b] of buttons.entries())b.classList.toggle('active',i===player.currentIndex);}sync();return{sync,buttons};
}
export function fillAnimationSelect(select,player,onChange){select.innerHTML='';for(const [i,name] of player.names.entries())select.add(new Option(name,String(i)));select.onchange=()=>{player.play(Number(select.value));onChange?.(player.current);};return select;}
function label(name){return name.replace(/^Armature\.001\|mixamo\.com\|Layer0(\.001)?$/,'mixamo$1').replace(/_Armature$/,'').replace(/^stand 2$/,'stand2').replace(/dance /,'dance-').slice(0,18);}
export default {mountAnimationButtons,fillAnimationSelect};
