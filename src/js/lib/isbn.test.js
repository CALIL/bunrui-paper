import { describe, expect, it } from 'vitest'
import { toIsbn13 } from './isbn.js'

/** EAN-13 として妥当か(全13桁の重み付き合計が10の倍数) */
const isValidEan13 = (isbn13) =>
    /^\d{13}$/.test(isbn13) &&
    [...isbn13].reduce(
        (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
        0,
    ) %
        10 ===
        0

describe('toIsbn13', () => {
    it('ISBN-10 を ISBN-13 に変換する', () => {
        // READMEのサンプル書誌
        expect(toIsbn13('4103534257')).toBe('9784103534259')
        expect(toIsbn13('4003124820')).toBe('9784003124826')
        expect(toIsbn13('4062748614')).toBe('9784062748612')
    })

    it('チェックディジットが 0 になるケースを扱える', () => {
        // 重み付き合計が50なので 10 - 0 = 10 ではなく 0 にしなければならない
        expect(toIsbn13('4000000000')).toBe('9784000000000')
    })

    it('末尾が X のISBN-10でも変換できる(元のチェックディジットは使わない)', () => {
        expect(toIsbn13('400310101X')).toBe('9784003101018')
        expect(toIsbn13('400310101X')).toBe(toIsbn13('4003101010'))
    })

    it('生成した13桁がEAN-13として妥当', () => {
        for (const isbn10 of [
            '4103534257',
            '4003124820',
            '4062748614',
            '400310101X',
            '4000000000',
        ]) {
            expect(isValidEan13(toIsbn13(isbn10))).toBe(true)
        }
    })

    it('値がないときは null を返す', () => {
        expect(toIsbn13(null)).toBeNull()
        expect(toIsbn13(undefined)).toBeNull()
        expect(toIsbn13('')).toBeNull()
    })

    it('数字にならないものは null を返す', () => {
        expect(toIsbn13('ABCDEFGHIJ')).toBeNull()
        expect(toIsbn13('4103')).toBeNull()
    })
})
