/*

 Unitrad UI 学校向け支援プログラム

 Copyright (c) 2020 CALIL Inc.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php

 */

const REGION = 'gk-2002000-3xj40'

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

window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('.emtop').insertAdjacentHTML('beforeend', '<div id="icons"></div>');
  const icons = document.getElementById('icons')
  if (icons) icons.innerHTML = '';

  const params = getQueryString()
  if (params.q && params.q.match(/^\d{3}$/)) {
    let ndcs = []
    let ndcs_add = []
    let count = 0
    Array.from({length: 10}).map(() => {
        ndcs.push(params.q.slice(0,1) + count + '0')
        count += 1
    })
    count = 0
    Array.from({length: 100}).map(() => {
      if (String(count).length === 1) {
        ndcs_add.push('0' + count + '0')
      } else {
        ndcs_add.push(count + '0')
      }
      count += 1
    })
    const new_ndcs = ndcs.concat(shuffle(ndcs_add))
    new_ndcs.slice(0, 20).map((ndc) => {
        const a = document.createElement('a')
        a.href = './?q=' + ndc
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        a.appendChild(img)
        icons.appendChild(a)
    })
  } else {
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
    shuffle(ndcs).slice(0, 20).map((ndc) => {
        const a = document.createElement('a')
        a.href = './?q=' + ndc
        const img = document.createElement('img')
        img.src = 'https://storage.googleapis.com/kumori-ndc/' + ndc + '_1.svg'
        img.width = 71
        img.alt = ndc
        img.title = ndc
        img.className = 'ndcCharacter'
        a.appendChild(img)
        icons.appendChild(a)
    })
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
})


import React from 'react';
import ReactDom from 'react-dom';
import Index from 'view/index.jsx';


Index.defaultProps.welcomeTitle = "このサービスについて";
Index.defaultProps.welcomeMessage = (
  <React.Fragment>
  <div>
    <div>
      <img src="./assets/tsukaikata-1.svg" alt="本をみつける" title="本をみつける" />
      <p>
        まずは読んだことのある本をさがしてみてね。もちろんこれから読みたい本でもいいよ。
      </p>
    </div>
    <div>
      <img src="./assets/tsukaikata-2.svg" alt="プリントしてかく" title="プリントしてかく" />
      <p>
        プリントボタンをおすと、印刷用のプリントがでてくるよ。印刷して、本のことを自由にかいてね。
      </p>
    </div>
    <div>
      <img src="./assets/tsukaikata-3.svg" alt="みて楽しむ" title="みて楽しむ" />
      <p>
        かきおわったら壁にはったり、ファイルにとじたりして、つかってね。楽しく本をみつけよう。
      </p>
    </div>
  </div>
  <hr />
  <p>
    このサービスは、カーリルとkumori<a href="https://kumori.info/bunruibooks/">「ブンルイ・ブックス」</a>のコラボにより、カーリルの検索技術の活用デモとして制作されました。
    検索対象は、<a href="https://blog.calil.jp/2020/04/bookwalk.html">カーリルブックウォーク</a>のために選書した20万冊です。
    カーリルの横断検索サービス<a href="https://blog.calil.jp/2016/06/unitradlocal.html">「カーリル Unitrad ローカル」</a>や、
    <a href="https://blog.calil.jp/2020/04/negima.html">「COVID-19 : 学校図書館支援プログラム」</a>を運用中の図書館では、このサービスと連携することができます。
  </p>
  </React.Fragment>
);


class customDetailView extends React.Component {
  constructor(props) {
    super(props);
    fetch(`https://private.calil.jp/bib/${REGION}/${props.book.id}.json`).then((r) => r.json()).then((data) => {
      if (data.class.length > 0) {
        const ndc = data.class[data.class.length - 1]
        // ndcかどうか判定
        if (ndc.match(/^\d{3}/)) {
          const bunruiBooks = document.querySelector('.bunruiBooks')
          const shrinkNDC = ndc.slice(0, 2) + '0'
          bunruiBooks.src = 'https://storage.googleapis.com/kumori-ndc/' + shrinkNDC + '_1.svg'
          bunruiBooks.alt = ndc
          bunruiBooks.title = ndc    
        }
      }
    });
  }

  print_exec() {
    this.window.location.href = 'https://calil.github.io/bunruiPaper/?id=' + this.props.book.id + '&region=' + REGION;
  }
  print() {
    let windowId = Math.random().toString(36).slice(-8);
    this.window = window.open("about:blank", windowId, "");
    this.print_exec()
  }

  render() {
    return (
      <div className="actions">
        <a onClick={this.print.bind(this)}>プリント</a>
      </div>
    )
  }
}

Index.defaultProps.customDetailView = customDetailView;


class YamaguchiNotFound extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="targetLibraries" style={{'margin': '30px 10px 0', 'lineHeight': '180%'}}>
        <fieldset>
          <legend>見つからないときは</legend>
          <div className="items">
            <ul style={{'margin': '0', 'paddingLeft': '20px', 'paddingBottom': '10px'}}>
              <li>単語に区切って入力する</li>
              <li>タイトルを最後まで入力する</li>
              <li>図書館に尋ねる</li>
            </ul>
          </div>
        </fieldset>
      </div>
    )
  }
}

window.options.customNotFoundView = YamaguchiNotFound;
window.options.holdingOrder = [];
window.options.filters.forEach((item) => {
  item.includes.forEach((id) => {
    if (window.options.holdingOrder.indexOf(id) === -1) {
      window.options.holdingOrder.push(id);
    }
  })
});


ReactDom.render(React.createElement(Index, window.options), document.getElementById('app'));
