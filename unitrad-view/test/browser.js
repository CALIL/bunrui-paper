import puppeteer from 'puppeteer';
import { expect } from 'chai';

// puppeteer options
const opts = {
  headless: true,
  // headless: false,
  // slowMo: 1000,
};

// expose variables
before(async function () {
  this.timeout(100000);
  global.expect = expect;
  global.browser = await puppeteer.launch(opts);
  global.page = await browser.newPage();
  await page.goto('http://localhost:3000/');
});

// close browser
after(() => {
  browser.close();
});

describe('ブラウザ上のテスト', () => {
  it('ブラウザのバージョン', async () => {
    console.log(await browser.version());
    expect(true).to.be.true;
  });

  // it('見出しの確認', async () => {
  //   await page.waitFor('h1');
  //   expect(await page.$$('h1')).to.have.lengthOf(1);
  // });

  describe('詳細検索', () => {
    // it('通常検索の表示確認', async () => {
    //   expect(await page.$$('#free')).to.have.lengthOf(1);
    //   expect(await page.$$('#searchButton')).to.have.lengthOf(1);
    //   expect(await page.$$('.advanced')).to.have.lengthOf(1);
    // });
    it('詳細検索に切り替え', async () => {
      await page.click('.advanced');
      expect(await page.$$('form.advanced')).to.have.lengthOf(1);
    });
    it('詳細検索項目の表示確認', async () => {
      expect(await page.$$('#title')).to.have.lengthOf(1);
      expect(await page.$$('#author')).to.have.lengthOf(1);
      expect(await page.$$('#publisher')).to.have.lengthOf(1);
      expect(await page.$$('#year_start')).to.have.lengthOf(1);
      expect(await page.$$('#year_end')).to.have.lengthOf(1);
      expect(await page.$$('#isbn')).to.have.lengthOf(1);
      expect(await page.$$('#searchButton')).to.have.lengthOf(1);
    });
    it('通常検索に切り替え', async () => {
      await page.click('.simple');
      expect(await page.$$('form.simple')).to.have.lengthOf(1);
    });
  });

  describe('検索', () => {

    it('フリーワードに1Q84と入力', async function () {
      await page.waitForSelector('#free');
      await page.type('#free', '1Q84');
    });

    it('検索', async function () {
      await page.waitForSelector('#searchButton');
      await page.click('#searchButton');
    });

    it('検索結果の検証', async function () {
      await page.waitForSelector('.results > .row.book');
      expect(await page.$$('.results > .row.book')).to.have.length.above(0)
    });

    it('1冊目の所蔵館を表示', async function () {
      await page.waitForSelector('.results > .row.book ');
      await page.click('.row.book:nth-child(2)');
      await page.waitForSelector('.row.book > .detail > .links > a');
      expect(await page.$$('.row.book > .detail > .links > a')).to.have.length.above(0)
    });
    it('検索結果を閉じる', async function () {
      await page.click('.row.book .close');
    });
    it('フリーワードを消去', async function () {
      await page.waitForSelector('#free');
      await page.type('#free', '');
      await page.waitForSelector('#searchButton');
      await page.click('#searchButton');
    });
  });
});
