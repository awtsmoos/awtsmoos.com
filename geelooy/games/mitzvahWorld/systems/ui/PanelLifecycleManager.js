// B"H
export function createPanelLifecycleManager(){const stack=[];return{open(id){if(!stack.includes(id))stack.push(id);return this.state()},close(id=stack.at(-1)){const i=stack.lastIndexOf(id);if(i>=0)stack.splice(i,1);return this.state()},collapse(id){return{id,collapsed:true}},state(){return{open:[...stack],top:stack.at(-1)||null}}}}
export default createPanelLifecycleManager;
