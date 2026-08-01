import { NDC_DIVISION_LABELS } from './ndc-divisions.js'

/**
 * NDC(日本十進分類法)の分類記号かどうか。3桁の数字で始まるものをNDCとみなす。
 * 書誌データには "K913" のような独自記号が入ることがあるため必要。
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isNdc = (value) => typeof value === 'string' && /^\d{3}/.test(value)

/**
 * 分類記号を第2次区分(綱目)に丸める。例: "913.6" -> "910"
 *
 * @param {string} ndc
 * @returns {string}
 */
export const toDivision = (ndc) => `${String(ndc).slice(0, 2)}0`

/**
 * 綱目コード全100件。例: ["000", "010", ..., "990"]
 *
 * Object.keys は "100" のような整数風のキーを数値順で先頭に並べ替えてしまうため、
 * ラベル表のキー順には依存せず生成する。
 *
 * @returns {string[]}
 */
export const allDivisions = () =>
    Array.from({ length: 100 }, (_, i) => `${String(i).padStart(2, '0')}0`)

/**
 * 同じ第1次区分(類)に属する綱目コード10件。例: "913.6" -> ["900", "910", ..., "990"]
 *
 * @param {string} ndc
 * @returns {string[]}
 */
export const divisionsInClass = (ndc) => {
    const head = String(ndc).slice(0, 1)
    return Array.from({ length: 10 }, (_, i) => `${head}${i}0`)
}

/**
 * 綱目コードの表示用ラベル。例: "910" -> "910 日本文学"
 * 未知のコードはコードのみを返す。
 *
 * @param {string} division
 * @returns {string}
 */
export const divisionLabel = (division) => {
    const label = NDC_DIVISION_LABELS[division]
    return label ? `${division} ${label}` : division
}
