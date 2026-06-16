/** B"H — fall delegates to jump/fall microposes. */
import { jump } from './Jump.js';
export function fall(p,f,info={}){return jump(p,f,info);}
