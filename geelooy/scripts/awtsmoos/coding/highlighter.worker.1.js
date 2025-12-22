/**
 * @ B"H
 * @file highlighter.worker.js
 * @version 2.0 (Olam HaYetzirah - The World of Formation)
 * @description The Neshama (Soul). This version is enhanced with the Sefirah of Da'at (Knowledge/Memory).
 * It no longer re-processes the entire text on every scroll. Instead, it maintains the full text in its
 * own state and caches the highlighter's state at the end of each line. When a scroll event occurs,
 * it finds the closest pre-computed state and begins highlighting from there, resulting in a
 * massive performance gain for large documents.
 */

// --- Worker State ---
let language = 'js'; // Default language, will be updated by 'setText' message.
let lines = [];
let lineStatesCache = []; // The cache for Da'at (Knowledge)

/**
 * @function getClosestCachedState
 * @description Searches backwards from a given line to find the nearest valid cached state.
 * @param {number} startLine - The line index to start searching from.
 * @returns {{state: object, line: number}} - The cached state and the line number it corresponds to.
 */
function getClosestCachedState(startLine) {
	for (let i = Math.min(startLine, lineStatesCache.length - 1); i >= 0; i--) {
		if (lineStatesCache[i]) {
			// Deep copy the state to prevent mutation of the cache
			return { state: JSON.parse(JSON.stringify(lineStatesCache[i])), line: i };
		}
	}
	// If no cache is found, return the initial state at line -1 (to start processing from line 0).
	return { state: _getInitialState(), line: -1 };
}


// --- Worker Message Handler ---
self.onmessage = (e) => {
	const { type, requestId } = e.data;

	switch (type) {
		/**
		 * Handles the initial setting or updating of the entire text content.
		 * This invalidates and clears all existing caches.
		 */
		case 'setText':
			{
				language = e.data.language || 'js'; // Update language
				lines = e.data.text.split('\n');
				lineStatesCache = []; // Clear the memory upon receiving new text.
				break;
			}

		/**
		 * The primary highlighting request, now correctly using the cache.
		 */
		case 'highlight':
			{
				const {
					firstLineToRender,
					numLinesToRender,
					scrollTopAtRequest,
					scrollLeftAtRequest
				} = e.data;

				if (lines.length === 0) return; // Nothing to highlight

				// Find the closest known state before the rendering area.
				// getClosestCachedState returns a deep copy, so we can mutate it freely.
				const { state: currentState, line: startLine } = getClosestCachedState(firstLineToRender - 1);

				// Process lines from the last cached point to the start of the render area,
				// updating currentState after each line and caching the result.
				for (let i = startLine + 1; i < firstLineToRender; i++) {
					const result = _getHighlightResult(lines[i] || '', currentState);
					// The 'currentState' object has been mutated by the function. Now cache it.
					lineStatesCache[i] = JSON.parse(JSON.stringify(currentState));
				}

				// Now, highlight only the visible lines for the response.
				const highlightedLines = [];
				for (let i = 0; i < numLinesToRender; i++) {
					const lineIndex = firstLineToRender + i;
					if (lineIndex < lines.length) {
						// Process the line. This mutates currentState for the *next* iteration of this loop.
						const result = _getHighlightResult(lines[lineIndex] || '', currentState);
						highlightedLines.push(result.html);
						
						// Update cache for the lines we just rendered, if not already present.
						if(!lineStatesCache[lineIndex]) {
							lineStatesCache[lineIndex] = JSON.parse(JSON.stringify(currentState));
						}

					} else {
						highlightedLines.push(null); // Signal end of content
					}
				}

				self.postMessage({
					type: 'highlightResult',
					htmlLines: highlightedLines,
					requestId: requestId,
					responseFirstLine: firstLineToRender,
					scrollTopAtRequest: scrollTopAtRequest,
					scrollLeftAtRequest: scrollLeftAtRequest
				});
				break;
			}
	}
};


// --- ALL HIGHLIGHTING LOGIC IS NOW SELF-CONTAINED IN THE WORKER ---
// (The following functions are the exact same "Soul" logic as before,
// but now they live cleanly in their own file without any string escaping.)

function _getInitialState() {
	return {
		contextStack: [{
			mode: language ===
				'js' ?
				'javascript' :
				language
		}],
		isNextTokenFunctionName: false,
		inCssRuleBlock: false // Important for CSS state
	};
}

function _getHighlightResult(line, state) {
	if (!line) return {
		html: '&nbsp;',
		state
	};
	let html = '';
	let i = 0;
	// The 'state' object is now correctly mutated by _getToken as it processes the line.
	while (i < line.length) {
		const i_before = i;
		const res = _getToken(line, i, state);
		html += res.html;
		i = res.newIndex;
		if (i === i_before) {
			html += _escape(line[i++]);
		}
	}
	// We return the same state object that was passed in, now holding the new state.
	return {
		html: html || '&nbsp;',
		state: state
	};
}

function _getToken(line, i, state) {
	const context = state.contextStack[
		state.contextStack.length -
		1];

	if (context.terminator && line
		.substring(i)
		.startsWith(context.terminator)
		) {
		const terminatorLength = context
			.terminator.length;
		let type = 'string';
		if (context.mode.includes(
				'comment')) type =
			'comment';
		if (context.mode.includes(
				'interpolation')) type =
			'controlKeyword';
		if (context.terminator
			.startsWith('</')) type =
			'tag';
		state.contextStack.pop();
		return {
			html: _wrap(line.substring(
				i, i +
				terminatorLength
				), type),
			newIndex: i +
				terminatorLength
		};
	}

	if (context.mode.startsWith(
			'template_') && line
		.substring(i)
		.startsWith('${')) {
		state.contextStack.push({
			mode: 'javascript_interpolation',
			terminator: '}',
			depth: 0
		});
		return {
			html: _wrap('${',
				'controlKeyword'),
			newIndex: i + 2
		};
	}

	let currentMode = context.mode;
	if (currentMode.startsWith(
			'template_language_')) {
		currentMode = currentMode
			.substring(18);
	}

	switch (currentMode) {
		case 'javascript':
		case 'javascript_interpolation':
			return _getJSToken(line, i,
				state);
		case 'html':
			return _getHTMLToken(line,
				i, state);
		case 'css':
			return _getCssToken(line, i,
				state);
		case 'template_literal': {
			const
				nextInterpolationIndex =
				_findUnescaped(line, '${', i);
			const nextTerminatorIndex =
				_findUnescaped(line, '`', i);
			let endOfChunk = line
			.length;
			if (nextInterpolationIndex !==
				-1) {
				endOfChunk =
					nextInterpolationIndex;
			}
			if (nextTerminatorIndex !==
				-1 &&
				nextTerminatorIndex <
				endOfChunk) {
				endOfChunk =
					nextTerminatorIndex;
			}
			if (endOfChunk > i) {
				return {
					html: _wrap(line
						.substring(
							i,
							endOfChunk
							),
						'string'),
					newIndex: endOfChunk
				};
			}
			return {
				html: _escape(line[i]),
				newIndex: i + 1
			};
		}
		case 'comment': {
			const endIdx = line.indexOf(
				context.terminator,
				i);
			const content = line
				.substring(i, endIdx !==
					-1 ? endIdx : line
					.length);
			return {
				html: _wrap(content,
					'comment'),
				newIndex: i + content
					.length
			};
		}
		case 'string': {
			const endIdx = _findUnescaped(
		                line,
				context.terminator,
				i);
			const content = line
				.substring(i, endIdx !==
					-1 ? endIdx : line
					.length);
			return {
				html: _wrap(content,
					'string'),
				newIndex: i + content
					.length
			};
		}
		default:
			return {
				html: _escape(line[i]),
					newIndex: i + 1
			};
	}
}

function _getJSToken(line, i, state) {
	const directives = [{
		tag: '/*html*/`',
		lang: 'html'
	}, {
		tag: '/*css*/`',
		lang: 'css'
	}, {
		tag: '/*js*/`',
		lang: 'javascript'
	}];
	for (const d of directives) {
		if (line.substring(i)
			.startsWith(d.tag)) {
			state.contextStack.push({
				mode: `template_language_${d.lang}`,
				terminator: '`'
			});
			return {
				html: _wrap(d.tag.slice(
							0, -1),
						'comment') +
					_wrap('`',
					'string'),
				newIndex: i + d.tag
					.length
			};
		}
	}
	const context = state.contextStack[
		state.contextStack.length -
		1];
	const char = line[i];
	if (line.substring(i, i + 2) ===
		'/*') {
		state.contextStack.push({
			mode: 'comment',
			terminator: '*/'
		});
		return {
			html: _wrap('/*',
				'comment'),
			newIndex: i + 2
		};
	}
	if (line.substring(i, i + 2) ===
		'//') {
		return {
			html: _wrap(line.substring(
				i), 'comment'),
			newIndex: line.length
		};
	}
	if (char === "'" || char === '"') {
		state.contextStack.push({
			mode: 'string',
			terminator: char
		});
		return {
			html: _wrap(char, 'string'),
			newIndex: i + 1
		};
	}
	if (char === '`') {
		state.contextStack.push({
			mode: 'template_literal',
			terminator: '`'
		});
		return {
			html: _wrap('`', 'string'),
			newIndex: i + 1
		};
	}
	if (context.mode ===
		'javascript_interpolation') {
		if (char === '{') {
			context.depth = (context
				.depth || 0) + 1;
		} else if (char === '}') {
			if (context.depth && context
				.depth > 0) {
				context.depth--;
			} else {
				return {
					html: '',
					newIndex: i
				};
			}
		}
	}
	const ctlK = new Set(['import',
		'as', 'from', 'export',
		'throw',
		'instanceof',
		'default',
		'async', 'function',
		'await', 'if', 'else',
		'return', 'for',
		'while', 'switch',
		'case', 'break',
		'continue', 'try',
		'catch', 'finally',
		'class', 'extends',
		'get', 'set', 'typeof',
		'of',
		'delete'
	]);
	const defK = new Set(['const',
		'let', 'var', 'true',
		'false', 'null',
		'undefined', 'this',
		'new', 'super'
	]);
	if (_isIS(char)) {
		let buffer = '',
			p = i;
		while (p < line.length && _isIP(
				line[p])) buffer +=
			line[p++];
		let type = 'variable';
		if (state
			.isNextTokenFunctionName) {
			type = 'functionName';
			state
				.isNextTokenFunctionName =
				false;
		} else if (buffer ===
			'function') {
			type = 'controlKeyword';
			state
				.isNextTokenFunctionName =
				true;
		} else if (ctlK.has(buffer))
			type = 'controlKeyword';
		else if (defK.has(buffer))
			type = 'definitionKeyword';
		else if (_isFC(line, p)) type =
			'functionName';
		return {
			html: _wrap(buffer, type),
			newIndex: p
		};
	}
	if (_isD(char)) {
		let buffer = '',
			p = i;
		while (p < line.length && (_isD(
					line[p]) || line[
				p] === '.')) buffer +=
			line[p++];
		return {
			html: _wrap(buffer,
				'number'),
			newIndex: p
		};
	}
	state.isNextTokenFunctionName =
		false;
	const isPunctuation = '{}[]().,;'
		.includes(char);
	const type = isPunctuation ?
		'punctuation' : 'operator';
	return {
		html: _wrap(char, type),
		newIndex: i + 1
	};
}

function _getHTMLToken(line, i, state) {
	const tagStart = line.indexOf('<',
		i);
	if (tagStart === -1) {
		return {
			html: _escape(line
				.substring(i)),
			newIndex: line.length
		};
	}
	let html = _escape(line.substring(i,
		tagStart));
	if (line.substring(tagStart)
		.startsWith('<!--')) {
		state.contextStack.push({
			mode: 'comment',
			terminator: '-->'
		});
		return {
			html: html + _wrap('<!--',
				'comment'),
			newIndex: tagStart + 4
		};
	}
	const tagEnd = line.indexOf('>',
		tagStart);
	if (tagEnd === -1) {
		return {
			html: html + _escape(line
				.substring(tagStart)
				),
			newIndex: line.length
		};
	}
	const isClosing = line[tagStart +
		1] === '/';
	html += _wrap(isClosing ? '</' :
		'<', 'punctuation');
	let p = isClosing ? tagStart + 2 :
		tagStart + 1;
	let tagName = '';
	while (p < tagEnd && !_isWS(line[
		p]) && line[p] !== '>')
		tagName += line[p++];
	html += _wrap(tagName, 'tag');
	const lowerTagName = tagName
		.toLowerCase();
	while (p < tagEnd) {
		const whitespaceStart = p;
		while (p < tagEnd && _isWS(line[
				p])) p++;
		if (p > whitespaceStart) {
			html += _escape(line
				.substring(
					whitespaceStart,
					p));
		}
		if (p >= tagEnd) break;
		const attrNameStart = p;
		while (p < tagEnd && !_isWS(
				line[p]) && line[p] !==
			'=' && line[p] !== '>') p++;
		html += _wrap(line.substring(
				attrNameStart, p),
			'attribute-name');
		if (p >= tagEnd) break;
		while (p < tagEnd && _isWS(line[
				p])) p++;
		if (line[p] === '=') {
			html += _wrap('=',
				'operator');
			p++;
			while (p < tagEnd && _isWS(
					line[p])) p++;
			const quote = line[p];
			if (quote === '"' ||
				quote === "'") {
				const valueStart = p +
				1;
				const valueEnd = line
					.indexOf(quote,
						valueStart);
				if (valueEnd !== -1 &&
					valueEnd < tagEnd) {
					html += _wrap(quote,
							'string') +
						_wrap(line
							.substring(
								valueStart,
								valueEnd
								),
							'attribute-value'
							) + _wrap(
							quote,
							'string');
					p = valueEnd + 1;
				} else {
					html += _wrap(line
						.substring(
							p,
							tagEnd),
						'string');
					p = tagEnd;
				}
			} else {
				const valueStart = p;
				while (p < tagEnd && !
					_isWS(line[p]) &&
					line[p] !== '>')
				p++;
				html += _wrap(line
					.substring(
						valueStart,
						p),
					'attribute-value'
					);
			}
		}
	}
	html += _wrap('>', 'punctuation');
	if (!isClosing && (lowerTagName ===
			'script' || lowerTagName ===
			'style')) {
		const lang = lowerTagName ===
			'script' ? 'javascript' :
			'css';
		state.contextStack.push({
			mode: lang,
			terminator: `</${lowerTagName}>`
		});
	}
	return {
		html,
		newIndex: tagEnd + 1
	};
}

function _getCssToken(line, i, state) {
	if (line.substring(i, i + 2) ===
		'/*') {
		state.contextStack.push({
			mode: 'comment',
			terminator: '*/'
		});
		return {
			html: _wrap('/*',
				'comment'),
			newIndex: i + 2
		};
	}
	const char = line[i];
	if (_isWS(char)) {
		let p = i;
		while (p < line.length && _isWS(
				line[p])) {
			p++;
		}
		return {
			html: line.substring(i, p),
			newIndex: p
		};
	}
	if (state.inCssRuleBlock) {
		if (char === '}') {
			state.inCssRuleBlock =
			false;
			return {
				html: _wrap('}',
					'punctuation'),
				newIndex: i + 1
			};
		}
		let p = i;
		while (p < line.length && !
			':;{}'.includes(line[p]) &&
			!_isWS(line[p])) {
			p++;
		}
		const buffer = line.substring(i,
			p);
		let nextChar = '';
		let next_p = p;
		while (next_p < line.length &&
			_isWS(line[next_p])) {
			next_p++;
		}
		if (next_p < line.length) {
			nextChar = line[next_p];
		}
		if (nextChar === ':') {
			return {
				html: _wrap(buffer,
					'property'),
				newIndex: p
			};
		}
		return {
			html: _wrap(buffer,
				'attribute-value'),
			newIndex: p
		};
	} else {
		if (char === '{') {
			state.inCssRuleBlock = true;
			return {
				html: _wrap('{',
					'punctuation'),
				newIndex: i + 1
			};
		}
		const braceIndex = line.indexOf(
			'{', i);
		const commentIndex = line
			.indexOf('/*', i);
		let end = braceIndex !== -1 ?
			braceIndex : line.length;
		if (commentIndex !== -1 &&
			commentIndex < end) {
			end = commentIndex;
		}
		return {
			html: _wrap(line.substring(
					i, end),
				'selector'),
			newIndex: end
		};
	}
}

// --- Helper Functions ---
function _findUnescaped(line, searchString, startIndex) {
    for (let i = startIndex; i < line.length; i++) {
        if (line.substring(i).startsWith(searchString)) {
            if (i > 0 && line[i - 1] === '\\') {
                let backslashCount = 0;
                let p = i - 1;
                while (p >= 0 && line[p] === '\\') {
                    backslashCount++;
                    p--;
                }
                if (backslashCount % 2 !== 0) {
                    continue; 
                }
            }
            return i; 
        }
    }
    return -1; 
}

function _escape(s) {
	return s ? s.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;") : ""
}

function _wrap(s, t) {
	return `<span class="token-${t}">${_escape(s)}</span>`
}

function _isWS(c) {
	return " " === c || "\t" === c ||
		"\n" === c || "\r" === c
}

function _isD(c) {
	return c >= "0" && c <= "9"
}

function _isIS(c) {
	return c >= "a" && c <= "z" || c >=
		"A" && c <= "Z" || "_" === c ||
		"$" === c
}

function _isIP(c) {
	return _isIS(c) || _isD(c)
}

function _isFC(line, i) {
	for (; i < line.length;) {
		if (!_isWS(line[i]))
		return "(" === line[i];
		i++
	}
	return !1
}
