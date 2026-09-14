/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#import "WptHarnessScript.h"

/**
 * Hooks testharness as soon as its callback API appears. The script records no
 * browser state itself; it forwards the authoritative WPT status/subtest data.
 */
NSString* AwtsWptHarnessScript(void) {
	return @"(()=>{"
		"const post=value=>{try{window.webkit.messageHandlers.awtsWpt.postMessage(value)}catch(error){}};"
		"let installed=false;"
		"const attach=()=>{"
			"if(installed)return;"
			"if(typeof add_completion_callback!=='function'){setTimeout(attach,2);return;}"
			"installed=true;"
			"add_completion_callback((tests,status)=>{"
				"post({kind:'complete',harnessStatus:Number(status.status),"
				"harnessMessage:String(status.message||''),tests:Array.from(tests||[],test=>({"
				"name:String(test.name||''),status:Number(test.status),message:String(test.message||'')}))});"
			"});"
		"};"
		"attach();"
		"setTimeout(()=>{if(!installed)post({kind:'no-harness'});},5000);"
	"})();";
}
