/**
 * ISBN-10 を ISBN-13(EAN-13)に変換する。
 * 変換できない場合は null を返す。
 *
 * @param {string | null | undefined} isbn10
 * @returns {string | null}
 */
export const toIsbn13 = (isbn10) => {
    if (!isbn10) return null
    // ISBN-10 の末尾はチェックディジット(X の場合がある)なので捨てる
    const digits = `978${String(isbn10).slice(0, 9)}`
    if (!/^\d{12}$/.test(digits)) return null
    // EAN-13 のチェックディジット: 先頭から数えて奇数桁は重み1、偶数桁は重み3
    const sum = [...digits].reduce(
        (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
        0,
    )
    return `${digits}${(10 - (sum % 10)) % 10}`
}
