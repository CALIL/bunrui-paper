/**
 * URLのクエリパラメータからアプリの状態を読む。
 *
 * @param {string} search location.search
 * @returns {{ id: string | null, region: string | null, editable: boolean }}
 */
export const parseState = (search) => {
    const params = new URLSearchParams(search)
    return {
        id: params.get('id'),
        region: params.get('region'),
        // 明示的に 'true' のときだけ編集モード
        editable: params.get('editable') === 'true',
    }
}
