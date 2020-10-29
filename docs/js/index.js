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
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        document.getElementById('icons').append(img)
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
    // fetch(`https://private.calil.jp/bib/${params.region}/${params.id}.json`).then((r) => r.json()).then((data) => {
    fetch(`https://negima-bib-l3cmcn337q-an.a.run.app/bib/${params.region}/${params.id}.json`).then((r) => r.json()).then((data) => {
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
            fontSize: 16,
            flat: true
        });
        const ndc = data.class[data.class.length - 1]
        document.getElementById('ndc').innerHTML = ndc
        // ndcのラベルをndc.devのAPIから取得
        fetch('https://api-4pccg7v5ma-an.a.run.app/ndc9/' + ndc).then((r) => r.json()).then((data) => {
            document.getElementById('ndc').innerHTML = ndc + ' ' + data['label@ja'].split('--')[0]
        })
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
            document.getElementById('icons2').append(img)
        })
        document.getElementById('cover').src = `https://asia-northeast1-libmuteki2.cloudfunctions.net/openbd_cover_with_google_books?isbn=` + data.normalized_isbn
        const ndcId = data.class[data.class.length - 1].slice(0, 2) + '0'
        document.querySelector('.character').src = 'https://storage.googleapis.com/kumori-ndc/' + ndcId + '_1.svg'
    })
}


render()