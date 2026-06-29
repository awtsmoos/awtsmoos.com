// B"H
/**
 * VendorRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createVendorRuntime(stock=[]){ let buyback=[]; return {
  list(){ return stock.map(item=>({...item})); },
  price(item,reputation=0){ return Math.max(1,Math.round((item.price||1)*(1-Math.min(.25,reputation/1000)))); },
  buy(id,ctx={}){ const item=stock.find(x=>x.id===id); if(!item) return {ok:false,error:'missing'}; const price=this.price(item,ctx.reputation||0); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:vendor-buy',{detail:{item,price}})); return {ok:true,item,price}; },
	  sell(item){ buyback.unshift({...item,soldAt:Date.now()}); buyback=buyback.slice(0,12); return {ok:true,buyback}; }
	}; }
export function openVendor(olam={},vendorId="toolmaker"){ const items=[{ id:"healing_herb", name:"Healing Herb", icon:"HERB", price:4 },{ id:"travel_bread", name:"Travel Bread", icon:"BREAD", price:3 },{ id:"repair_kit", name:"Repair Kit", icon:"TOOLS", price:8 },{ id:"simple_cloak", name:"Simple Cloak", icon:"COAT", price:12 }]; olam.ayshPeula?.("ui event","vendorScreen",{ vendorId, items }); return { vendorId, items, repair:true }; }
export default createVendorRuntime;
