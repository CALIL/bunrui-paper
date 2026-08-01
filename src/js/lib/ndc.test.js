import { describe, expect, it } from 'vitest'
import { allDivisions, divisionLabel, divisionsInClass, isNdc, toDivision } from './ndc.js'
import { NDC_DIVISION_LABELS } from './ndc-divisions.js'

describe('isNdc', () => {
    it('3桁の数字で始まるものをNDCとみなす', () => {
        expect(isNdc('913')).toBe(true)
        expect(isNdc('913.6')).toBe(true)
        expect(isNdc('007.3')).toBe(true)
    })

    it('独自記号や不足桁は除外する', () => {
        // 書誌データには "K913"(児童書)のような館独自の記号が入ることがある
        expect(isNdc('K913')).toBe(false)
        expect(isNdc('91')).toBe(false)
        expect(isNdc('')).toBe(false)
        expect(isNdc(null)).toBe(false)
        expect(isNdc(undefined)).toBe(false)
        expect(isNdc(913)).toBe(false)
    })
})

describe('toDivision', () => {
    it('綱目(第2次区分)に丸める', () => {
        expect(toDivision('913.6')).toBe('910')
        expect(toDivision('007')).toBe('000')
        expect(toDivision('490')).toBe('490')
    })
})

describe('allDivisions', () => {
    it('000から990まで100件を返す', () => {
        const divisions = allDivisions()
        expect(divisions).toHaveLength(100)
        expect(divisions[0]).toBe('000')
        expect(divisions.at(-1)).toBe('990')
        expect(new Set(divisions).size).toBe(100)
    })

    it('すべて綱目コードの形式になっていて、ラベル表と1対1で対応する', () => {
        const divisions = allDivisions()
        for (const division of divisions) {
            expect(division).toMatch(/^\d{2}0$/)
            expect(NDC_DIVISION_LABELS).toHaveProperty(division)
        }
        expect(divisions).toHaveLength(Object.keys(NDC_DIVISION_LABELS).length)
    })
})

describe('divisionsInClass', () => {
    it('同じ類の綱目10件を返す', () => {
        expect(divisionsInClass('913.6')).toEqual([
            '900',
            '910',
            '920',
            '930',
            '940',
            '950',
            '960',
            '970',
            '980',
            '990',
        ])
        expect(divisionsInClass('007')).toEqual([
            '000',
            '010',
            '020',
            '030',
            '040',
            '050',
            '060',
            '070',
            '080',
            '090',
        ])
    })

    it('返すコードはすべて既知の綱目', () => {
        for (const ndc of ['000', '350', '913.6']) {
            for (const division of divisionsInClass(ndc)) {
                expect(NDC_DIVISION_LABELS).toHaveProperty(division)
            }
        }
    })
})

describe('divisionLabel', () => {
    it('コードとラベルを連結する', () => {
        expect(divisionLabel('010')).toBe('010 図書館．図書館学')
        expect(divisionLabel('910')).toBe('910 日本文学')
    })

    it('未知のコードはそのまま返す', () => {
        expect(divisionLabel('999')).toBe('999')
    })
})

describe('NDC_DIVISION_LABELS', () => {
    it('100件すべてに空でないラベルがある', () => {
        const entries = Object.entries(NDC_DIVISION_LABELS)
        expect(entries).toHaveLength(100)
        for (const [code, label] of entries) {
            expect(code).toMatch(/^\d{2}0$/)
            expect(label.length).toBeGreaterThan(0)
        }
    })

    it('凍結されている', () => {
        expect(Object.isFrozen(NDC_DIVISION_LABELS)).toBe(true)
    })
})
