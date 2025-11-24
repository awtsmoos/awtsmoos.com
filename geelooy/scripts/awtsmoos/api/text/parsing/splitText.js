//B"H
import simplifyHTML from "./simplifyHTML.js";
window.simplifyHTML = simplifyHTML;
export default parseHebrew;
//B"H

function rs(txt) {
	return simplifyHTML(
        txt//.split(" ").filter(Boolean).join(" ")
    );
}

function onlyHas(txt, tok) {
	return txt.split('').every(char => tok.includes(char));
}

function parseHebrew(heb, w) {
	var dp = new DOMParser()
	var parst = dp.parseFromString(heb, "text/html")
	var verseSection = null;
	var nm = parst.querySelector(".versenum")
	if(nm) {
		verseSection = nm.getAttribute("id").replace("v", "");
		var pn = parseFloat(verseSection);
		if(!isNaN(pn)) verseSection = pn;
		nm.remove();
	}
	var b = parst.body.innerHTML;
	var split = []
	var splitUp = b.split("")
	var curWords = "";
    
    var otherPunc = "\"'`";
	
	var toSplitBy = ".,)]:;-;?!\n\r";
	var puncCheck = " " + toSplitBy + otherPunc
	var puncs =  toSplitBy ;
	var inParenthesis = false;
	var openedParenthesis = 0
	var closedParenthesis = 0;

	var space = " \n\r\t"
    var openedBrackets = 0
    var closedBrackets = 0;
    var inBrackets = false;
    
	var lastWordWasPunc = false;
	var isNextWordPunc = false;

    var inSmallQuote = false;
    var inBigQuote = false
    var keepIt = "([";

	var index = 0;
	var lastChar = ""
	for(var char of splitUp) {
		if(index > 0 && puncCheck.includes(splitUp[index - 1])) 
            lastWordWasPunc = true;
		else lastWordWasPunc = false;
		if(index < splitUp.length - 1 && toSplitBy.includes(splitUp[index + 1])) {
			isNextWordPunc = true;
		} else isNextWordPunc = false;

		var nextChar = index < splitUp.length-1 ? 
			splitUp[index+1] : "";

		lastChar = index > 0 ? splitUp[index-1] : ""
		if(char == "(") {
			openedParenthesis++
			curWords += " ";
		}
		if(char == ")") {
			openedParenthesis--
		}
		inParenthesis = openedParenthesis > closedParenthesis

        if(char == "[") {
			openedBrackets++
			curWords += " ";
		}
		if(char == "]") {
			openedBrackets--
		}
		inBrackets = openedParenthesis > closedParenthesis

        if(char == "'") {
            inSmallQuote = !inSmallQuote;
        }
        
        if(char == '"') {
            inBigQuote = !inBigQuote;
        }
		curWords += char;
		var worded = rs(curWords.trim())
		var isOnlyPunc = onlyHas(worded, puncs) // 
	
        var shouldSplitByParenthsis = true;
		var nextIsOpening = keepIt.includes(nextChar)
           // (openedBrackets > 0 && openedParenthesis > 0) || 
			//keepIt.includes(char);
		if(/*!inSmallQuote && !inBigQuote && */
			(space.includes(nextChar) || 
			(
				nextIsOpening//?
				//space.includes(lastChar) : true
		
			)) &&
            shouldSplitByParenthsis && (
				!nextIsOpening ? 
					toSplitBy.includes(char)
				: true
			)
             && !isOnlyPunc &&
			//   
			!isNextWordPunc && worded.length > 1) {
				split.push(worded)
    			curWords = ""/*
            if(!keepIt.includes(char)) {
    			
            } else {
                var almostAll = worded.substring(
                    0, worded.length - 2
                )
                var last = char;
                split.push(almostAll)
                curWords = char;
            }*/
		}
		index++
	}
	
	var worded = rs(curWords.trim())
	var isOnlyPunc = onlyHas(worded, puncs)
	if(worded.length && !isOnlyPunc) {
		split.push(rs(curWords.trim()));
	}
    
	return w ? {
		subSections: split,
		verseSection,
		hideVerseNumber: w.hideVerseNumber
	} : split;
}