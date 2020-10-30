/*

 Unitrad UI 学校向け支援プログラム

 Copyright (c) 2020 CALIL Inc.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php

 */

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
  if (params.ndc) {
    const shrinkNDC = params.ndc.slice(0, 2) + '0'
    document.querySelector('.logo').insertAdjacentHTML('beforebegin', '<img alt="' + params.ndc + '" title="' + params.ndc + '" class="ndcCharacter" src="https://storage.googleapis.com/kumori-ndc/' + shrinkNDC + '_1.svg">');

    let ndcs = []
    let ndcs_add = []
    let count = 0
    Array.from({length: 10}).map(() => {
        ndcs.push(params.ndc.slice(0,1) + count + '0')
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
        a.href = './?ndc=' + ndc
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
        a.href = './?ndc=' + ndc
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
  <div>
    このサービスは、カーリルの<a href="https://blog.calil.jp/2020/04/negima.html">「COVID-19:学校図書館支援プログラム」</a>の運用例の参考に作成したデモ画面です。
    <ul>
      <li><a href="https://blog.calil.jp/2020/04/bookwalk.html">カーリルブックウォーク</a>のために選定した20万冊が検索対象です</li>
      <li>予約申し込みは<a href="https://www.google.com/intl/ja_jp/forms/about/">Googleフォーム</a>に連携しています（これはあくまで連携例であり、運用にあわせて調整することができます）</li>
      <li>書影（本の表紙画像）は<a href="https://openbd.jp/">openBDプロジェクト</a>および<a href="https://books.google.co.jp/">Google Books</a>と連携しています</li>
      <li><a href="https://calil.jp/privacy/">プライバシーポリシー</a>に基づきパーソナルデータは厳重に保護されます。クッキーやGoogle Analyticsなどによるアクセストラッキングは実施しません。</li>
      <li>この説明文は、任意の内容に変更することができます</li>
    </ul>
  </div>
);


class customDetailView extends React.Component {
  constructor(props) {
    super(props);
  }

  print_exec() {
    this.window.location.href = 'https://calil.github.io/bunruiPaper/?id=' + this.props.book.id + '&region=gk-2002000-3xj40';
  }
  print() {
    let windowId = Math.random().toString(36).slice(-8);
    this.window = window.open("about:blank", windowId, "");
    this.print_exec()
  }

  render() {
    return (
      <div className="actions">
        <a onClick={this.print.bind(this)}>印刷する</a>
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
