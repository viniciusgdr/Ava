import puppeteer from 'puppeteer';
export async function getHtmlJson(page: puppeteer.Page) {
    let json = await page.evaluate(() => {
        return JSON.parse(document.body.innerText)
    })
    return json
}

export const getstr = (string, start, end, i) => {
    i++;
    var str = string.split(start);
    var str = str[i].split(end);
    return str[0];
};