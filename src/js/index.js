import '@fontsource/kosugi-maru/400.css'
import JsBarcode from 'jsbarcode'
import 'paper-css/paper.css'
import '../index.sass'
import { toIsbn13 } from './lib/isbn.js'
import { allDivisions, divisionLabel, divisionsInClass, isNdc, toDivision } from './lib/ndc.js'
import { sample } from './lib/shuffle.js'
import { parseState } from './lib/state.js'

const CHARACTER_BASE = 'https://storage.googleapis.com/kumori-ndc'
const NDC_API = 'https://api-4pccg7v5ma-an.a.run.app'
const BIB_API = 'https://private.calil.jp'
const THUMBNAIL_API = 'https://ndlsearch.ndl.go.jp/thumbnail'

/** 交互表示するSVGが用意されているのはこの9区分だけ */
const ANIMATED_DIVISIONS = new Set(['010', '020', '030', '040', '050', '060', '070', '080', '090'])

/** ヘッダー・フッターに並べるキャラクターの数 */
const CHARACTER_COUNT = 10

const $ = (id) => document.getElementById(id)

/**
 * JSONを取得する。HTTPエラーもreject扱いにする(fetchは4xx/5xxでrejectしないため)。
 *
 * @param {string} url
 * @returns {Promise<unknown>}
 */
const fetchJson = async (url) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} (${url})`)
    }
    return response.json()
}

/**
 * 画面上部にエラーを表示する。原因が分からないまま白紙になるのを防ぐ。
 *
 * @param {string} message
 * @param {unknown} [cause]
 */
const showError = (message, cause) => {
    if (cause) console.error(message, cause)
    const box = $('error')
    if (!box) return
    box.textContent = message
    box.hidden = false
}

/**
 * NDCキャラクターの要素を作る。
 * アニメーションがある区分は2枚重ねて、切り替えはCSSアニメーションに任せる。
 *
 * @param {string} division 綱目コード(例: "910")
 * @returns {HTMLSpanElement}
 */
const createCharacter = (division) => {
    const label = divisionLabel(division)
    const animated = ANIMATED_DIVISIONS.has(division)

    const wrapper = document.createElement('span')
    wrapper.className = 'ndc-character'
    wrapper.title = label

    const first = document.createElement('img')
    first.src = `${CHARACTER_BASE}/${division}_1.svg`
    first.alt = label
    wrapper.append(first)

    if (animated) {
        const second = document.createElement('img')
        second.src = `${CHARACTER_BASE}/animation/${division}_2.svg`
        // 1枚目と同じ絵柄の別フレームなので読み上げ対象から外す
        second.alt = ''
        wrapper.append(second)
    }
    return wrapper
}

/**
 * 指定した綱目コードからランダムに選んでキャラクターを並べ直す。
 *
 * @param {string} containerId
 * @param {readonly string[]} divisions
 */
const renderCharacters = (containerId, divisions) => {
    const container = $(containerId)
    if (!container) return
    container.replaceChildren(
        ...sample(divisions, CHARACTER_COUNT).map((division) => createCharacter(division)),
    )
}

/** 書影を設定する。取得できない場合はグレーの箱にする。 */
const renderCover = (isbn13, title) => {
    const cover = $('cover')
    if (!cover) return
    cover.alt = title
    cover.title = title
    if (!isbn13) {
        cover.style.backgroundColor = '#CCCCCC'
        return
    }
    cover.addEventListener('error', () => {
        cover.style.display = 'none'
    })
    cover.src = `${THUMBNAIL_API}/${isbn13}.jpg`
}

/** 書誌情報を流し込む。値はすべてAPI由来なのでtextContentで扱う。 */
const renderBibliography = (data) => {
    const title = data.title?.[0] ?? ''
    document.title = title
    renderCover(toIsbn13(data.normalized_isbn), title)

    $('title').textContent = title
    $('volume').textContent = data.volume?.[0] ?? ''
    $('author').textContent = data.author?.[0] ?? ''
    $('publisher').textContent = data.publisher?.[0] ?? ''

    const pubdate = data.pubdate?.[0] ?? ''
    $('pubdate').textContent = pubdate
    if (!pubdate) $('pubdate').style.display = 'none'
}

/** ISBNのバーコードを描画する。 */
const renderBarcode = (isbn13) => {
    if (!isbn13) return
    JsBarcode('#isbn', isbn13, {
        format: 'EAN13',
        lineColor: '#000000',
        background: 'transparent',
        width: 1.5,
        height: 40,
        displayValue: true,
        font: "'Kosugi Maru', sans-serif",
        fontSize: 16,
        flat: true,
    })
}

/**
 * 分類が取れなかったときの表示。フッターは全区分からランダムに選ぶ。
 */
const renderWithoutNdc = () => {
    renderCharacters('icons2', allDivisions())
}

/**
 * 分類が取れたときの表示。左下の大きなキャラクターとフッターを描画し、
 * 詳細なラベルだけAPIから取りに行く。
 *
 * @param {string} ndc
 */
const renderNdc = async (ndc) => {
    const division = toDivision(ndc)
    const ndcBox = $('ndc')
    ndcBox.textContent = ndc

    const character = document.createElement('img')
    character.src = `${CHARACTER_BASE}/${division}_1.svg`
    character.alt = divisionLabel(division)
    character.title = character.alt
    document.querySelector('.character')?.append(character)

    // フッターは同じ類(第1次区分)の綱目から選ぶ
    renderCharacters('icons2', divisionsInClass(ndc))

    // 綱目より細かいラベルは同梱の表にないのでAPIから取得する(約1.6KB)
    try {
        const detail = await fetchJson(`${NDC_API}/ndc9/${ndc}`)
        const name = detail['label@ja'] || detail['prefLabel@ja'] || ''
        if (!name) return
        const label = `${ndc} ${name.split('--')[0]}`
        ndcBox.textContent = label
        character.alt = label
        character.title = label
    } catch (error) {
        // ラベルが細かくならないだけで表示は成立するので、画面には出さない
        console.error('NDCラベルの取得に失敗しました', error)
    }
}

/**
 * 感想を表示する。編集モードでは表示しない。
 *
 * @param {readonly {annotation?: string}[]} holdings
 */
const renderAnnotations = (holdings) => {
    const annotations = holdings.map((holding) => holding.annotation).filter(Boolean)
    if (annotations.length === 0) return

    const container = $('annotations')
    const namae = document.querySelector('.namae')
    if (namae) namae.style.display = 'none'
    container.style.display = 'block'

    // 左下のキャラクターを避けるための回り込み用要素
    const mask = document.createElement('div')
    mask.id = 'mask'
    container.append(mask)

    for (const annotation of annotations) {
        const paragraph = document.createElement('p')
        paragraph.textContent = annotation
        container.append(paragraph, document.createElement('hr'))
    }

    const baseHeight = mask.clientHeight
    container.addEventListener('scroll', () => {
        const { scrollTop } = container
        mask.style.height = `${baseHeight + scrollTop}px`
        mask.style.shapeOutside = `polygon(0px ${185 + scrollTop}px, 173px ${185 + scrollTop}px, 208px ${250 + scrollTop}px, 234px ${350 + scrollTop}px, 0px ${350 + scrollTop}px)`
    })
}

/** 名前の入力欄。前回の入力をlocalStorageから復元する。 */
const setUpNameField = () => {
    const name = $('name')
    const saved = localStorage.getItem('bunruiName')
    if (saved) name.value = saved
    name.addEventListener('change', (event) => {
        localStorage.setItem('bunruiName', event.target.value)
    })
}

const main = async () => {
    const state = parseState(location.search)

    renderCharacters('icons', allDivisions())
    setUpNameField()

    if (state.editable) {
        $('comment').style.display = 'block'
        $('name').style.display = 'block'
    }

    // idとregionが揃っていなければ書誌は引けない(移行前と同じくフッターは空のまま)
    if (!state.id || !state.region) return

    let data
    try {
        data = await fetchJson(`${BIB_API}/bib/${state.region}/${state.id}.json`)
    } catch (error) {
        showError(`書誌情報を取得できませんでした (id=${state.id}, region=${state.region})`, error)
        renderWithoutNdc()
        return
    }

    renderBibliography(data)
    renderBarcode(toIsbn13(data.normalized_isbn))

    const ndc = data.class?.at(-1)
    if (isNdc(ndc)) {
        await renderNdc(ndc)
    } else {
        if (ndc) $('ndc').textContent = ndc
        renderWithoutNdc()
    }

    // 編集モードでは既存の感想を出さない
    if (!state.editable) {
        renderAnnotations(data.raw_holdings ?? [])
    }
}

main().catch((error) => {
    showError('ページの初期化に失敗しました', error)
})
