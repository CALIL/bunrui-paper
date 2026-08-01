import { describe, expect, it } from 'vitest'
import { parseState } from './state.js'

describe('parseState', () => {
    it('id と region を読む', () => {
        expect(parseState('?id=4103534257&region=gk-2002000-3xj40')).toEqual({
            id: '4103534257',
            region: 'gk-2002000-3xj40',
            editable: false,
        })
    })

    it('先頭の ? があってもなくても同じ', () => {
        expect(parseState('id=123&region=abc')).toEqual(parseState('?id=123&region=abc'))
    })

    it("editable は 'true' のときだけ有効", () => {
        expect(parseState('?editable=true').editable).toBe(true)
        expect(parseState('?editable=false').editable).toBe(false)
        expect(parseState('?editable=1').editable).toBe(false)
        expect(parseState('?editable=TRUE').editable).toBe(false)
        expect(parseState('?editable').editable).toBe(false)
        expect(parseState('').editable).toBe(false)
    })

    it('パラメータがなければ null になる', () => {
        expect(parseState('')).toEqual({ id: null, region: null, editable: false })
    })

    it('URLエンコードされた値をデコードする', () => {
        expect(parseState('?id=%E6%97%A5%E6%9C%AC').id).toBe('日本')
    })
})
