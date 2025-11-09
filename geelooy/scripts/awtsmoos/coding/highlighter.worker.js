/**
 * @ B"H
 * @file highlighter.worker.js
 * @description The Neshama (Soul). This is the pure, unbreakable state machine,
 * living in its own world, unburdened by the concerns of the physical DOM.
 * Its sole purpose is to receive text and return the light of highlighted HTML.
 */

// --- Worker State ---
let language = 'js';

// --- Worker Message Handler ---
/**
 * @file highlighter.worker.js
 * @description The Neshama (Soul). This is the pure, unbreakable state machine.
 */
self.onmessage = (e) => {
	const {
		type,
		text,
		firstLineToRender,
		numLinesToRender,
		language: newLanguage,
		requestId,
		scrollTopAtRequest,
		scrollLeftAtRequest
	} = e.data;

	if (type === 'highlight') {
		const lines = text.split(
			'\n');
		language = newLanguage;

		let state =
			_getInitialState();

		// Fast-forward state to the first visible line
		for (let i = 0; i <
			firstLineToRender; i++
			) {
			state =
				_getHighlightResult(
					lines[i] || '',
					state)
				.state;
		}

		// Highlight only the visible lines
		const highlightedLines = [];
		for (let i = 0; i <
			numLinesToRender; i++) {
			const lineIndex =
				firstLineToRender +
				i;
			if (lineIndex < lines
				.length) {
				const result =
					_getHighlightResult(
						lines[
							lineIndex
							] || '',
						state);
				highlightedLines
					.push(result
						.html);
				state = result
				.state;
			} else {
				highlightedLines
					.push(
					null); // Signal end of content
			}
		}

		// The soul returns the original coordinate with the result.
		self.postMessage({
			type: 'highlightResult',
			htmlLines: highlightedLines,
			requestId: requestId,
			// Return the original coordinate. The Soul provides the Body with spatial awareness.
			responseFirstLine: firstLineToRender,
			// Pass the original scroll coordinates back, untouched.
			scrollTopAtRequest: scrollTopAtRequest,
			scrollLeftAtRequest: scrollLeftAtRequest

		});
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

function _getHighlightResult(line,
	state) {
	if (!line) return {
		html: '&nbsp;',
		state
	};
	let html = '';
	let i = 0;
	while (i < line.length) {
		const i_before = i;
		const res = _getToken(line, i,
			state);
		html += res.html;
		i = res.newIndex;
		if (i === i_before) {
			html += _escape(line[i++]);
		}
	}
	return {
		html: html || '&nbsp;',
		state
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
				line.indexOf('${', i);
			const nextTerminatorIndex =
				line.indexOf('`', i);
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
			const endIdx = line.indexOf(
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
		'of'
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