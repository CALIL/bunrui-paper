function getQueryString() {
    var params = {}
    location.search.substr(1).split('&').map(function(param) {
        var pairs = param.split('=');
        params[pairs[0]] = decodeURIComponent(pairs[1]);
    });
    return params;    
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
    ndcs.map((ndc) => {
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 50
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

const params = getQueryString()
console.log(params)

if (params.id) {
    fetch(`https://private.calil.jp/bib/gk-2002000-3xj40/${params.id}.json`).then((r) => r.json()).then((data) => {
        console.log(data)
        document.getElementById('title').innerHTML = data.title[0]
        document.getElementById('author').innerHTML = data.author[0]
        document.getElementById('publisher').innerHTML = data.publisher[0]
        document.getElementById('pubdate').innerHTML = data.pubdate[0]
    })
}


render()