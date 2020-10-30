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
        const a = document.createElement('a')
        a.href = 'https://try.calil.jp/bunrui/?ndc=' + ndc
        a.target = '_blank'
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        a.appendChild(img)
        icons.appendChild(a)
    })
    Array.prototype.slice.call(document.querySelectorAll('img')).map((img) => {
        setInterval(() => {
            const filenames = img.src.split('/').slice(-1)[0].split('_')
            let src = ''
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
    const src = `978${isbn10.slice(0, 9)}`;
    const sum = src.split('').map(s => parseInt(s))
        .reduce((p, c, i) => p + ((i % 2 === 0) ? c : c * 3));
     const rem = 10 - sum % 10;
    const checkdigit = rem === 10 ? 0 : rem;
    return `${src}${checkdigit}`;
};

const params = getQueryString()
if (params.id && params.region) {
    fetch(`https://private.calil.jp/bib/${params.region}/${params.id}.json`).then((r) => r.json()).then((data) => {
    // fetch(`https://negima-bib-l3cmcn337q-an.a.run.app/bib/${params.region}/${params.id}.json`).then((r) => r.json()).then((data) => {
        document.getElementById('cover').src = `https://asia-northeast1-libmuteki2.cloudfunctions.net/openbd_cover_with_google_books?isbn=` + data.normalized_isbn
        document.title = data.title[0]
        document.getElementById('title').innerHTML = data.title[0]
        document.getElementById('volume').innerHTML = data.volume[0]
        document.getElementById('author').innerHTML = data.author[0]
        document.getElementById('publisher').innerHTML = data.publisher[0]
        document.getElementById('pubdate').innerHTML = data.pubdate[0]
        // document.getElementById('isbn').innerHTML = data.normalized_isbn
        // JsBarcode('#isbn', data.normalized_isbn);
        JsBarcode('#isbn', toISBN13(data.normalized_isbn), {
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
        if (data.class.length > 0) {
            const ndc = data.class[data.class.length - 1]
            document.getElementById('ndc').innerHTML = ndc
            // ndcかどうか判定
            if (!ndc.match(/^\d{3}/)) return noNDC()

            // 左下のキャラクターを追加
            const a = document.createElement('a')
            a.href = 'https://try.calil.jp/bunrui/?ndc=' + ndc
            a.target = '_blank'
            const img = document.createElement('img')
            const shrinkNDC = data.class[data.class.length - 1].slice(0, 2) + '0'
            img.src = 'https://storage.googleapis.com/kumori-ndc/' + shrinkNDC + '_1.svg'
            a.appendChild(img)
            document.querySelector('.character').appendChild(a)

            // ndcのラベルをndc.devのAPIから取得
            fetch('https://api-4pccg7v5ma-an.a.run.app/ndc9/' + ndc).then((r) => r.json()).then((data) => {
                const temp = data['label@ja'] !== '' ? data['label@ja'] : data['prefLabel@ja']
                const label = ndc + ' ' + temp.split('--')[0]
                document.getElementById('ndc').innerHTML = label
                document.querySelector('.character img').alt = label
                document.querySelector('.character img').title = label
            })
            let ndcs = []
            let count = 0
            Array.from({length: 10}).map(() => {
                ndcs.push(ndc.slice(0,1) + count + '0')
                count += 1
            })
            shuffle(ndcs).slice(0, 10).map((ndc) => {
                const a = document.createElement('a')
                a.href = 'https://try.calil.jp/bunrui/?ndc=' + ndc
                a.target = '_blank'
                const img = document.createElement('img')
                img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
                img.width = 71
                img.alt = ndc
                img.title = ndc
                img.className = 'ndcCharacter'
                a.appendChild(img)
                document.getElementById('icons2').appendChild(a)
            })
        } else {
            noNDC()
        }
    })
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
        const a = document.createElement('a')
        a.href = 'https://try.calil.jp/bunrui/?ndc=' + ndc
        a.target = '_blank'
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        a.appendChild(img)
        document.getElementById('icons2').appendChild(a)
    })        
}

render()