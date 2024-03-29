# Bunrui Paper

本の感想用ページの表示ツール

https://bunrui-paper.calil.dev/?id=4103534257&region=gk-2002000-3xj40&editable=true

## コンセプト

- 本の感想を書ける書式を、書誌データとともに表示する
- 感想・名前を書けるフォームを表示できる
- 既存の感想を表示できる
- URLからパラメータを受け取ることができる（連携API）

![画面イメージ](preview.png "画面イメージ")

## 連携API

以下のようなURLでパラメータを受け取ることができます。

`https://bunrui-paper.calil.dev/?param1=xx&param2=xx`

|  パラメータ  |  内容  | 備考 |
| ---- | ---- | ---- |
|  id  |  書誌ID  | 必須 |
|  region  |  学校図書館支援プログラムのリージョンID  | 必須 |
|  editable  |  感想・名前のフォーム表示  | editable='true'で有効化 |

## 開発

```
npm install  
npm start
```

## リリースビルド

```
npm run build
```

## デプロイ

GitHub Pagesで公開

## アイコン

[ブンルイ・ブックス ©kumori](https://kumori.info/bunruibooks/)

Google Cloud Storageに保存\
https://console.cloud.google.com/storage/browser/kumori-ndc;tab=objects?forceOnBucketsSortingFiltering=false&project=calil-sandbox&prefix=&forceOnObjectsSortingFiltering=false

```
https://storage.googleapis.com/kumori-ndc/{{ndc}}_1.svg
https://storage.googleapis.com/kumori-ndc/{{ndc}}_2.svg
```

## ライセンス

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
