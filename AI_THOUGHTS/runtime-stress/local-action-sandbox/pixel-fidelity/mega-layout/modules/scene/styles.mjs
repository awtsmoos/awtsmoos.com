// B"H
/**
 * Navy style module: overflow and layout witnesses are made louder. The
 * Awtsmoos makes every important visual gate readable at phone-screenshot scale.
 */
export function sceneCss() {
  return `${base()}${layout()}${tiles()}${overflow()}${controls()}`;
}

function base() {
  return `body{margin:0;background:#050914;color:white;font-family:system-ui,sans-serif}.page{width:960px;height:640px;overflow:hidden;box-sizing:border-box;padding:8px;background:linear-gradient(135deg,#061226,#102b57);display:grid;grid-template-rows:60px 1fr;gap:8px}.card{background:linear-gradient(135deg,#172b4b,#07101f);border:2px solid #47dbff;border-radius:12px;padding:6px;box-shadow:0 0 12px #00d9ff66;overflow:hidden}h1{font-size:17px;line-height:1.05;margin:0}h2{font-size:12px;margin:0 0 4px}.small{font-size:10px}.rainbow{height:26px;border:2px solid white;border-radius:999px;background:linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,magenta)}.sticky{background:#ffe14a;color:#06101f;border:2px solid white;border-radius:999px;padding:7px 9px;font-weight:900;text-align:center}`;
}

function layout() {
  return `.hero{display:grid;grid-template-columns:210px 260px 88px 1fr;gap:10px;align-items:center}.hero b{font-size:12px}.body{display:grid;grid-template-columns:316px 316px 300px;gap:8px;min-height:0}.tower{display:flex;flex-direction:column;gap:8px;min-height:0}.gridA{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:110px 110px 110px;gap:7px}.gridB{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:110px 110px 110px;gap:7px}.right{display:grid;grid-template-rows:202px 166px 1fr;gap:8px;min-height:0}.webgl{display:grid;grid-template-rows:18px 1fr}`;
}

function tiles() {
  return `.tile{background:#08162a;border:2px solid #8290ff;border-radius:10px;padding:4px;box-sizing:border-box;overflow:hidden;display:grid;grid-template-rows:15px 1fr}.tile b{font-size:10px;white-space:nowrap}.nestBand{height:112px}.nestedFlex{display:flex;gap:6px;height:100%}.nestedFlex.column{flex-direction:column}.nestCell{flex:1;border:1px solid #47dbff;border-radius:6px;padding:3px;display:block;overflow:hidden}.nestCell canvas{width:100%;height:100%}.stackWitness{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;height:38px;margin-top:4px}.stackWitness span{border:1px solid white;border-radius:5px;text-align:center;font-size:8px;padding-top:8px}.zA{background:#f40070}.zB{background:#00d9ff;color:#06101f}.zC{background:#ffe14a;color:#06101f}`;
}

function overflow() {
  return `.overflowGrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.overflowCase{height:62px;border:2px solid white;border-radius:9px;background:#020810;position:relative;font-size:9px;color:white;box-sizing:border-box;padding:3px}.hiddenCase{overflow:hidden}.scrollCase{overflow:scroll;--scroll-y:.72;--scroll-y-ratio:.32;--scroll-thumb:#00e5ff;--scroll-track:#10213b;scrollbar-color:#00e5ff #10213b}.xScrollCase{overflow-x:scroll;overflow-y:hidden;--scroll-x:.58;--scroll-x-ratio:.28;--scroll-thumb:#ffdf3a;--scroll-track:#30142a;scrollbar-color:#ffdf3a #30142a}.autoCase{overflow:auto;--scroll-y:.35;--scroll-x:.2;--scroll-y-ratio:.48;--scroll-x-ratio:.42;--scroll-thumb:#ff00a8;--scroll-track:#06101f;scrollbar-color:#ff00a8 #06101f}.slab{position:absolute;left:8px;top:25px;width:210px;height:28px;background:linear-gradient(90deg,red,yellow,lime,cyan,blue,magenta);box-shadow:0 0 14px white;border:2px solid white}.xScrollCase .slab{width:260px;height:24px}.hiddenCase .slab{transform:rotate(10deg)}`;
}

function controls() {
  return `.controls{display:grid;grid-template-columns:1fr 1fr;gap:6px}.control{height:28px;background:#06152a;color:white;border:2px solid #00d9ff;border-radius:8px;padding:4px;font-size:10px;font-weight:800}.zbox{height:44px;position:relative;margin-top:4px}.float{position:absolute;border:2px solid white;border-radius:8px;padding:4px;font-size:10px;font-weight:900}.z1{left:4px;top:9px;background:#f40070;transform:rotate(-8deg)}.z2{left:72px;top:17px;background:#00d9ff;color:#06101f;transform:scale(1.1)}.z3{left:143px;top:7px;background:#ffe14a;color:#06101f;transform:translate(2px,7px) rotate(7deg)}`;
}
