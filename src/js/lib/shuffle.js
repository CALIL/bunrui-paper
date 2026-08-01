/**
 * Fisher-Yates でシャッフルした新しい配列を返す(元の配列は変更しない)。
 *
 * @template T
 * @param {readonly T[]} items
 * @returns {T[]}
 */
export const shuffle = (items) => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

/**
 * ランダムに count 件取り出す。
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} count
 * @returns {T[]}
 */
export const sample = (items, count) => shuffle(items).slice(0, count)
