function getQueryString() {
    var params = {}
    location.search.substr(1).split('&').map(function(param) {
        var pairs = param.split('=');
        params[pairs[0]] = decodeURIComponent(pairs[1]);
    });
    return params;    
}

function shuffle(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      let rand = Math.floor(Math.random() * (i + 1));
      // 配列の数値を入れ替える
      [array[i], array[rand]] = [array[rand], array[i]]
    }
    return array;
}


// ndc.devから分類番号一覧を取得
fetch('https://api-4pccg7v5ma-an.a.run.app/ndc9.json').then((r) => r.json()).then((ndcData) => {
    const ndcCharacters =  Array.from(document.querySelectorAll('img.ndcCharacter'))
    ndcCharacters.map((ndcCharacter) => {
        const ndc = ndcCharacter.alt
        const ndcLabel = ndc + ' ' + ndcData[ndc]['label@ja']
        ndcCharacter.alt = ndcLabel
        ndcCharacter.title = ndcLabel
    })
})


const render = () => {
    // ヘッダーのキャラクターを追加
    const icons = document.getElementById('icons')
    if (icons) icons.innerHTML = '';
    let count = 0
    const ndcs = []
    Array.from({length: 100}).map(() => {
        if (String(count).length === 1) {
            ndcs.push('0' + count + '0')
        } else {
            ndcs.push(count + '0')
        }
        count += 1
    })
    shuffle(ndcs).slice(0, 10).map((ndc) => {
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        icons.appendChild(img)
    })
    // キャラクターのアニメーション
    Array.prototype.slice.call(document.querySelectorAll('img.ndcCharacter')).map((img) => {
        setInterval(() => {
            const filenames = img.src.split('/').slice(-1)[0].split('_')
            let src = ''
            // アニメーションがあるのは、この9個のみ
            if (['010','020','030','040','050','060','070','080','090'].indexOf(filenames[0]) !== -1) {
                if (filenames[1] === '1.svg') {
                    src = 'https://storage.googleapis.com/kumori-ndc/animation/' + filenames[0] + '_' + '2.svg'
                } else {
                    src = 'https://storage.googleapis.com/kumori-ndc/animation/' + filenames[0] + '_' + '1.svg'           
                }
                img. src = src
            }
        }, 800)
    })    
}


const toISBN13 = (isbn10) => {
    if(isbn10 === null) return null
    const src = `978${isbn10.slice(0, 9)}`;
    const sum = src.split('').map(s => parseInt(s))
        .reduce((p, c, i) => p + ((i % 2 === 0) ? c : c * 3));
     const rem = 10 - sum % 10;
    const checkdigit = rem === 10 ? 0 : rem;
    return `${src}${checkdigit}`;
};

const state = getQueryString()
if (state.id && state.region) {
    fetch(`https://private.calil.jp/bib/${state.region}/${state.id}.json`).then((r) => r.json()).then((data) => {
        const isbn13 = toISBN13(data.normalized_isbn)
        if (isbn13) {
            document.getElementById('cover').src = `https://cover.openbd.jp/${isbn13}.jpg`
        } else {
            document.getElementById('cover').style.backgroundColor = '#CCCCCC'
        }
        document.getElementById('cover').alt = data.title[0] ? data.title[0] : ''
        document.getElementById('cover').title = data.title[0] ? data.title[0] : ''
        document.title = data.title[0] ? data.title[0] : ''
        document.getElementById('title').innerHTML = data.title[0] ? data.title[0] : ''
        document.getElementById('volume').innerHTML = data.volume[0] ? data.volume[0] : ''
        document.getElementById('author').innerHTML = data.author[0] ? data.author[0] : ''
        document.getElementById('publisher').innerHTML = data.publisher[0] ? data.publisher[0] : ''
        document.getElementById('pubdate').innerHTML = data.pubdate[0] ? data.pubdate[0] : ''
        if (!data.pubdate[0]) document.getElementById('pubdate').style.display = 'none'
        // document.getElementById('isbn').innerHTML = data.normalized_isbn
        // JsBarcode('#isbn', data.normalized_isbn);
        if (isbn13) {
            JsBarcode('#isbn', isbn13, {
                format: 'EAN13',
                lineColor: "#000000",
                background: 'transparent',
                width: 1.5,
                height: 40,
                displayValue: true,
                font: "'Kosugi Maru', sans-serif",
                fontSize: 16,
                flat: true
            });
        }
        // console.log(data.class)
        if (data.class && data.class.length > 0) {
            const ndc = data.class[data.class.length - 1]
            document.getElementById('ndc').innerHTML = ndc
            // ndcかどうか判定
            if (!ndc.match(/^\d{3}/)) {
                noNDC()
            } else {
                // 左下のキャラクターを追加
                const img = document.createElement('img')
                const shrinkNDC = data.class[data.class.length - 1].slice(0, 2) + '0'
                img.src = 'https://storage.googleapis.com/kumori-ndc/' + shrinkNDC + '_1.svg'
                document.querySelector('.character').appendChild(img)

                // ndcのラベルをndc.devのAPIから取得
                fetch('https://api-4pccg7v5ma-an.a.run.app/ndc9/' + ndc).then((r) => r.json()).then((data) => {
                    const temp = data['label@ja'] !== '' ? data['label@ja'] : data['prefLabel@ja']
                    const label = ndc + ' ' + temp.split('--')[0]
                    document.getElementById('ndc').innerHTML = label
                    document.querySelector('.character img').alt = label
                    document.querySelector('.character img').title = label
                })

                // フッターのキャラクターを追加 本の大分類と同じ
                let ndcs = []
                let count = 0
                Array.from({length: 10}).map(() => {
                    ndcs.push(ndc.slice(0,1) + count + '0')
                    count += 1
                })
                shuffle(ndcs).slice(0, 10).map((ndc) => {
                    const img = document.createElement('img')
                    img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
                    img.width = 71
                    img.alt = ndc
                    img.title = ndc
                    img.className = 'ndcCharacter'
                    document.getElementById('icons2').appendChild(img)
                })
            } 
        } else {
            noNDC()
        }
        console.log(state)
        // 感想の表示判定 編集モードの時は処理しない
        if (!state.editable || state.editable!=='true') {
            const annotations = []
            if (data.raw_holdings) {
                data.raw_holdings.map((raw_holding) => {
                    if (raw_holding.annotation) {
                        annotations.push(raw_holding.annotation)
                    }
                })
            }
            if (annotations.length > 0) {
                // document.querySelector('.character').style.display = 'none'
                document.querySelector('.namae').style.display = 'none'
                document.getElementById('annotations').style.display = 'block'
                // 左下のキャラクターのマスクを追加
                const div = document.createElement('div')
                div.id = 'mask'
                document.getElementById('annotations').appendChild(div)
                annotations.map((annotation) => {
                    const p = document.createElement('p')
                    p.innerText = annotation
                    const hr = document.createElement('hr')
                    document.getElementById('annotations').appendChild(p)
                    document.getElementById('annotations').appendChild(hr)
                })
                const height = parseInt(document.getElementById('mask').clientHeight)
                document.getElementById('annotations').addEventListener('scroll', () => {
                    const scrollTop = document.getElementById('annotations').scrollTop
                    document.getElementById('mask').style.height = height + scrollTop + 'px'
                    document.getElementById('mask').style.shapeOutside = `polygon(0px ${185+scrollTop}px, 173px ${185+scrollTop}px, 208px ${250+scrollTop}px, 234px ${350+scrollTop}px, 0px ${350+scrollTop}px)`
                })
            }
        }
    })
}
// 感想のテキストエリアの表示判定
if (state.editable && state.editable==='true') {
    document.getElementById('comment').style.display = 'block'
    document.getElementById('name').style.display = 'block'
}
document.getElementById('name').addEventListener('change', (event) => {
    localStorage.setItem('bunruiName', event.target.value)
})
if (localStorage.getItem('bunruiName')) {
    document.getElementById('name').value = localStorage.getItem('bunruiName')
}


const noNDC = () => {
    let count = 0
    const ndcs = []
    Array.from({length: 100}).map(() => {
        if (String(count).length === 1) {
            ndcs.push('0' + count + '0')
        } else {
            ndcs.push(count + '0')
        }
        count += 1
    })
    document.getElementById('icons2').innerHTML = ''
    shuffle(ndcs).slice(0, 10).map((ndc) => {
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        document.getElementById('icons2').appendChild(img)
    })        
}

render()