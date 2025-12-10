const esbuild = require("esbuild");
const { copy } = require('esbuild-plugin-copy');

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: "esbuild-problem-matcher",

	setup(build) {
		build.onStart(() => {
			console.log("[watch] build started");
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(
					`    ${location.file}:${location.line}:${location.column}:`
				);
			});
			console.log("[watch] build finished");
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			"src/mcp/serverScript.ts",
			"src/mcp/index.ts",
			"src/extension.ts",
		],
		bundle: true,
		format: "cjs",
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: "node",
		outdir: "dist",
		outbase: "src",
		external: ["vscode"],
		entryNames: "[dir]/[name]",
		logLevel: "silent",
		plugins: [
			esbuildProblemMatcherPlugin,
			copy({
				assets: [
					{
						from: ['./src/assets/**/*'],
						to: ['./mcp/assets'],
					},
				],
			}),
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
