#!/usr/bin/env node
// vite build の成果物(docs/)が期待どおりに生成されているか検証する
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docs = path.join(root, 'docs')

const errors = []
const checks = []

const rel = (file) => path.relative(root, file).split(path.sep).join('/')

const ok = (message) => checks.push(message)
const ng = (message) => {
    errors.push(message)
    checks.push(null)
}

/** ディレクトリ配下のファイルを相対パスの配列で返す */
const listFiles = async (dir) => {
    const entries = await readdir(dir, { recursive: true, withFileTypes: true })
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(dir, path.join(entry.parentPath ?? entry.path, entry.name)))
        .sort()
}

// docs/ そのものの存在確認
try {
    if (!(await stat(docs)).isDirectory()) throw new Error()
} catch {
    console.error('✗ docs/ がありません。先に npm run build を実行してください')
    process.exit(1)
}

// public/ の中身がそのままコピーされているか(Viteは変換せずコピーする)
const publicDir = path.join(root, 'public')
const publicFiles = await listFiles(publicDir)
if (publicFiles.length === 0) {
    ng('public/ にファイルがありません')
}
for (const file of publicFiles) {
    const src = path.join(publicDir, file)
    const dest = path.join(docs, file)
    let destBody
    try {
        destBody = await readFile(dest)
    } catch {
        ng(`${rel(dest)} が生成されていません`)
        continue
    }
    if ((await readFile(src)).equals(destBody)) {
        ok(`${rel(dest)} (${destBody.length} bytes)`)
    } else {
        ng(`${rel(dest)} の内容が ${rel(src)} と一致しません`)
    }
}

// エントリのビルド結果
let html = null
try {
    html = await readFile(path.join(docs, 'index.html'), 'utf8')
    if (html.includes('/src/')) {
        ng('docs/index.html に /src/ への参照が残っています(Viteの変換が効いていません)')
    } else {
        ok(`docs/index.html (${Buffer.byteLength(html)} bytes)`)
    }
} catch {
    ng('docs/index.html が生成されていません')
}

for (const [file, label] of [
    ['index.css', 'Sassのコンパイル結果'],
    ['js/index.js', 'エントリJS'],
]) {
    try {
        const body = await readFile(path.join(docs, file), 'utf8')
        if (body.trim().length === 0) {
            ng(`docs/${file} が空です (${label})`)
        } else {
            ok(`docs/${file} (${Buffer.byteLength(body)} bytes)`)
        }
    } catch {
        ng(`docs/${file} が生成されていません (${label})`)
    }
}

if (html) {
    // index.html が参照するローカルファイルが docs/ 配下に存在するか
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((url) => !/^(?:[a-z]+:|\/\/|#)/i.test(url))
    const seen = new Set()
    for (const url of refs) {
        const target = url.split(/[?#]/)[0]
        if (target === '' || seen.has(target)) continue
        seen.add(target)
        try {
            await stat(path.join(docs, target))
            ok(`docs/index.html → ${target}`)
        } catch {
            ng(`docs/index.html が参照する ${target} が docs/ にありません`)
        }
    }

    // JSはエントリ1本にバンドルされる。vendorスクリプトの読み込みが残っていないこと
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)]
        .map((match) => match[1])
        .filter((attrs) => !/\bsrc\s*=\s*"[a-z]+:|\bsrc\s*=\s*"\/\//i.test(attrs))
    if (scripts.length !== 1) {
        ng(`ローカルの<script>が${scripts.length}個です(バンドル後は1個であるべき)`)
    } else if (!/\btype\s*=\s*"module"/.test(scripts[0])) {
        ng('エントリJSの<script>にtype="module"がありません')
    } else {
        ok('JSはtype="module"のエントリ1本にバンドルされている')
    }

    // 外部CDNへの実行時依存を持ち込んでいないこと
    const cdn = /cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.exec(html)
    if (cdn) {
        ng(`docs/index.html に外部CDNへの参照が残っています (${cdn[0]})`)
    } else {
        ok('docs/index.html に外部CDNへの参照がない')
    }
}

// CSSが参照するローカルファイル(フォント)が実在するか、vendor CSSが取り込まれているか
try {
    const css = await readFile(path.join(docs, 'index.css'), 'utf8')

    const urls = [
        ...new Set(
            [...css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)]
                .map((match) => match[2].split(/[?#]/)[0])
                .filter((url) => !/^(?:[a-z]+:|\/\/)/i.test(url)),
        ),
    ]
    const missing = []
    for (const url of urls) {
        try {
            await stat(path.join(docs, url))
        } catch {
            missing.push(url)
        }
    }
    if (urls.length === 0) {
        ng('docs/index.css がフォントを1つも参照していません')
    } else if (missing.length > 0) {
        ng(`docs/index.css が参照する${missing.length}件が見つかりません (例: ${missing[0]})`)
    } else {
        ok(`docs/index.css のローカル参照 ${urls.length}件がすべて存在する`)
    }

    // CDNから移した2つが実際にバンドルされているか
    if (css.includes('Kosugi Maru')) {
        ok('Kosugi Maru がセルフホストされている')
    } else {
        ng('docs/index.css に Kosugi Maru の @font-face がありません')
    }
    if (/\.sheet\b/.test(css)) {
        ok('paper-css がバンドルされている')
    } else {
        ng('docs/index.css に paper-css のスタイルが含まれていません')
    }
} catch {
    // 生成物そのものの有無は上でチェック済み
}

// jsbarcodeが実際にバンドルされているか(依存解決の失敗を実行時ではなくここで検知する)。
// 'EAN13' はアプリ側のオプション指定にも現れるためマーカーにできない。
// jsbarcodeのフォーマット登録テーブル由来で、かつアプリが使わない名前で判定する
try {
    const entry = await readFile(path.join(docs, 'js', 'index.js'), 'utf8')
    const markers = ['pharmacode', 'codabar', 'GenericBarcode']
    const missing = markers.filter((marker) => !entry.includes(marker))
    if (missing.length === 0) {
        ok('jsbarcodeがバンドルされている')
    } else {
        ng(
            `docs/js/index.js にjsbarcode由来の ${missing.join(', ')} がありません(バンドルされていません)`,
        )
    }
} catch {
    // 生成物そのものの有無は上でチェック済み
}

for (const check of checks) {
    if (check) console.log(`✓ ${check}`)
}
if (errors.length > 0) {
    console.error('')
    for (const error of errors) console.error(`✗ ${error}`)
    console.error(`\nビルド検証に失敗しました: ${errors.length}件`)
    process.exit(1)
}
console.log(`\nビルド検証に成功しました: ${checks.length}件`)
