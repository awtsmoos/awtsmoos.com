// B"H
/**
 * @file mainMenu.js
 * @description
 * Chapter 8: The main gate becomes intense without becoming messy. The
 * Awtsmoos carves a golden village portal, mobile-first, with breathing sky,
 * soft glass, readable title, and one huge action button that actually feels
 * like entering an Olam.
 */
export default /*css*/`
  .menu{
    width:100vw;height:100vh;position:fixed;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:1000;font-family:'Fredoka One',Arial,sans-serif;color:#fff3c4;background:#050307;pointer-events:auto!important
  }
  .menu::before{content:"";position:absolute;inset:-20%;background:radial-gradient(circle at 20% 18%,rgba(255,207,76,.28),transparent 28%),radial-gradient(circle at 78% 26%,rgba(70,190,255,.2),transparent 30%),radial-gradient(circle at 50% 110%,rgba(41,160,62,.42),transparent 38%),linear-gradient(180deg,#101a2b 0%,#493716 56%,#09210b 100%);animation:awtsMenuBreath 14s ease-in-out infinite;transform:scale(1.02)}
  .menu::after{content:"ב״ה";position:absolute;right:18px;top:14px;color:rgba(255,224,117,.6);font-size:18px;text-shadow:0 0 14px rgba(255,210,80,.5)}
  .menu .rectangle{position:absolute;border-radius:6px;background:linear-gradient(180deg,rgba(255,222,110,.55),rgba(255,164,51,.15));box-shadow:0 0 18px rgba(255,202,82,.28);pointer-events:none}
  .menu-vessel{position:relative;z-index:2;width:min(92vw,760px);min-height:min(76vh,680px);display:grid;grid-template-rows:auto 1fr auto;align-items:center;gap:22px;padding:clamp(22px,5vw,46px);border:2px solid rgba(255,212,86,.72);border-radius:34px;background:linear-gradient(180deg,rgba(30,20,9,.76),rgba(3,4,2,.88));box-shadow:0 24px 70px rgba(0,0,0,.68),inset 0 0 28px rgba(255,209,82,.1);backdrop-filter:blur(10px);overflow:hidden;text-align:center}
  .menu-vessel::before{content:"";position:absolute;left:50%;top:14px;transform:translateX(-50%);width:92px;height:8px;border-radius:999px;background:#e1b14b;box-shadow:0 0 16px rgba(255,212,93,.45)}
  .menu-vessel::after{content:"";position:absolute;inset:12px;border-radius:26px;border:1px solid rgba(255,255,255,.08);pointer-events:none}
  .mainTitle{display:grid;gap:4px;margin-top:14px;position:relative;z-index:2}
  .title-word{font-size:clamp(42px,13vw,108px);font-weight:900;letter-spacing:clamp(2px,1.3vw,14px);line-height:.88;text-transform:uppercase;color:#fff7d1;text-shadow:0 4px 0 rgba(0,0,0,.65),0 0 32px rgba(255,211,88,.38);white-space:nowrap}
  .title-word.gold{color:#ffde59;text-shadow:0 4px 0 rgba(0,0,0,.7),0 0 38px rgba(255,222,89,.58)}
  .mainTitle::after{content:"A living village of mitzvos, coins, ladders, and gates";font-family:Arial,sans-serif;font-weight:900;font-size:clamp(13px,3.1vw,20px);letter-spacing:.04em;color:#ffeab0;text-shadow:0 2px 8px #000;margin-top:12px}
  .menu-actions{width:100%;max-width:520px;margin:auto;display:grid;gap:14px;position:relative;z-index:2}
  .mitzvahBtn{width:100%!important;min-height:74px!important;border:0!important;border-radius:24px!important;background:linear-gradient(180deg,#ffe06a,#d7951b 58%,#8c520a)!important;color:#140c00!important;font-size:clamp(22px,6vw,34px)!important;font-weight:900!important;letter-spacing:.035em!important;text-shadow:0 1px 0 rgba(255,255,255,.35)!important;box-shadow:0 9px 0 #4e2d05,0 0 36px rgba(255,203,74,.36)!important;padding:14px 18px!important;cursor:pointer!important;touch-action:manipulation!important;transition:transform .12s ease,filter .12s ease!important}
  .mitzvahBtn:active{transform:translateY(5px)!important;box-shadow:0 4px 0 #4e2d05,0 0 26px rgba(255,203,74,.28)!important;filter:brightness(1.04)!important}
  .menu-actions::after{content:"Tap Enter World to begin in the grounded village";font-family:Arial,sans-serif;color:rgba(255,240,194,.78);font-size:14px;font-weight:800;text-shadow:0 2px 8px #000}
  .loginHeader{position:absolute;top:18px;right:18px;z-index:5}
  @keyframes awtsMenuBreath{0%,100%{filter:saturate(1) brightness(1);transform:scale(1.02)}50%{filter:saturate(1.25) brightness(1.08);transform:scale(1.06)}}
  @media(max-width:520px){.menu-vessel{width:calc(100vw - 28px);min-height:calc(100vh - 56px);border-radius:28px;padding:30px 16px 22px}.mitzvahBtn{min-height:68px!important}.title-word{font-size:clamp(40px,16vw,72px)}}
  @media(max-height:620px){.menu-vessel{min-height:calc(100vh - 28px);gap:12px;padding:22px 16px}.mainTitle::after,.menu-actions::after{display:none}.mitzvahBtn{min-height:58px!important}}
`;
