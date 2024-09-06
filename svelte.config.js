import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import * as shiki from 'shiki';  // Importing from latest version of Shiki
import { rosePineMoon } from './themes/rose-pine-moon.js';

let cachedHighlighter = null;

const getCachedHighlighter = async () => {
    if (!cachedHighlighter) {
        try {
            cachedHighlighter = await shiki.createHighlighter({
                theme: rosePineMoon,  // Single theme
                langs: ['javascript', 'typescript', 'svelte', 'python', 'jsx']
            });
        } catch (error) {
            console.error("Error initializing highlighter: ", error);
            throw error;
        }
    }
    return cachedHighlighter;
};

const highlightCode = async (code, lang, meta) => {
	const shikiHighlighter = await getCachedHighlighter();
	let html;
	let blockName = '';

	if (meta && meta.startsWith('(') && meta.endsWith(')')) {
		blockName = meta.substring(1, meta.length - 1).trim();
		meta = null;
	}

	html = escapeSvelte(shikiHighlighter.codeToHtml(code, { lang , theme: rosePineMoon}));

	if (blockName) {
		html = `<div class="code-block-title">${blockName}</div>${html}`;
	}

	return html
};

const mdsvexOptions = {
    extensions: ['.md', '.svelte'],
    highlight: {
        highlighter: highlightCode,
    },
};

const config = {
    extensions: ['.svelte', '.svx', '.md'],
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
    kit: {
        adapter: adapter(),
    },
    // files: {
    //     assets: ['src/posts/knowledge-graph-rag/images', 'src/posts/knowledge-graph-llm/images'],
    // },
};

export default config;
