import { defineConfig } from 'vite'

/**
 * @fontsource のCSSは woff2 と woff の両方を参照する。
 * 対象ブラウザはすべて woff2 に対応しているため woff の参照を落とす。
 * 参照が消えることで woff ファイル自体もビルド成果物に含まれなくなる(出力が半減する)。
 */
const dropLegacyWoff = () => ({
    name: 'drop-legacy-woff',
    enforce: 'pre',
    transform(code, id) {
        if (!id.includes('@fontsource') || !id.includes('.css')) return null
        return code.replace(/,\s*url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/g, '')
    },
})

/** フォントは数が多いので docs/ 直下ではなく docs/fonts/ にまとめる */
const assetFileNames = (assetInfo) => {
    const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''
    return /\.(?:woff2?|ttf|otf|eot)$/.test(name) ? 'fonts/[name][extname]' : '[name][extname]'
}

export default defineConfig({
    // GitHub Pagesで相対パス配信するため
    base: './',
    plugins: [dropLegacyWoff()],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'docs',
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                // ハッシュを付けず、移行前と同じ docs/ の構造を維持する
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames,
            },
        },
    },
    test: {
        include: ['src/**/*.test.js'],
        environment: 'node',
    },
})
