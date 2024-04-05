import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { mdsvex, escapeSvelte } from 'mdsvex'
import { getHighlighter } from 'shiki'

// function rangeParser(ranges) {
//   const result = [];
//   const parts = ranges.split(',');

//   for (let part of parts) {
//     if (part.includes('-')) {
//       const [start, end] = part.split('-').map(Number);
//       for (let i = start; i <= end; i++) {
//         result.push(i);
//       }
//     } else {
//       result.push(Number(part));
//     }
//   }

//   return result;
// }

const highlightCode = async (code, lang, meta) => {
	const shikiHighlighter = await getHighlighter({
		themes: ['rose-pine-moon'],
		langs: ['javascript', 'typescript', 'svelte', 'python']
	})
	await shikiHighlighter.loadLanguage('javascript', 'typescript', 'python')
	let html;
	let blockName = '';

	if (meta && meta.startsWith('(') && meta.endsWith(')')) {
		blockName = meta.substring(1, meta.length - 1).trim();
		meta = null;
	}

	// if (!meta) {
		html = escapeSvelte(shikiHighlighter.codeToHtml(code, { lang , theme: 'rose-pine-moon'}));
	// } else {
	// 	const highlightMetaMatch = /{([\\d,-]+)}/.exec(meta);
	// 	const highlightMeta = highlightMetaMatch ? highlightMetaMatch[1] : '';
	// 	const highlightLines = rangeParser(highlightMeta);
	// 	console.log(meta, highlightLines)
	// 	html = escapeSvelte(shikiHighlighter.codeToHtml(code, {
	// 		lang,
	// 		theme: 'rose-pine-moon',
	// 		lineOptions: highlightLines.map((element) => ({
	// 			line: element,
	// 			classes: ['highlight-line'],
	// 		})),
	// 	}));
	// }

	if (blockName) {
		html = `<div class="code-block-title">${blockName}</div>${html}`;
	}

	return html
}

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svelte'],
	highlight: {
		highlighter: highlightCode
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter()
	}
}

export default config