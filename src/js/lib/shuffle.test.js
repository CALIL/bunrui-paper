import { describe, expect, it } from 'vitest'
import { sample, shuffle } from './shuffle.js'

const items = Array.from({ length: 20 }, (_, i) => i)

describe('shuffle', () => {
    it('元の配列を変更しない', () => {
        const original = [...items]
        shuffle(items)
        expect(items).toEqual(original)
    })

    it('要素を過不足なく保つ(並べ替えのみ)', () => {
        const result = shuffle(items)
        expect(result).toHaveLength(items.length)
        expect([...result].sort((a, b) => a - b)).toEqual(items)
    })

    it('空配列と1要素でも壊れない', () => {
        expect(shuffle([])).toEqual([])
        expect(shuffle(['a'])).toEqual(['a'])
    })

    it('実際に並びが変わる(20要素を10回試して一度も変わらないことはない)', () => {
        const changed = Array.from({ length: 10 }, () => shuffle(items)).some((result) =>
            result.some((value, index) => value !== items[index]),
        )
        expect(changed).toBe(true)
    })
})

describe('sample', () => {
    it('指定件数だけ取り出す', () => {
        expect(sample(items, 5)).toHaveLength(5)
    })

    it('重複せず、元の配列に含まれる要素だけを返す', () => {
        const result = sample(items, 5)
        expect(new Set(result).size).toBe(5)
        for (const value of result) expect(items).toContain(value)
    })

    it('件数が要素数を超えても全件までしか返さない', () => {
        expect(sample(items, 999)).toHaveLength(items.length)
    })
})
