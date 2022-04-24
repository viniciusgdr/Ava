import puppeteer from 'puppeteer';
import { IAvaTrilhasResponse } from '../types';
export async function avaTrilhas(avaUrl: string, user: string, key: string, {
    headless = true,
    args = [],
    executablePath = ''
}): Promise<IAvaTrilhasResponse> {
    let browser = await puppeteer.launch({
        headless: headless,
        args: args,
        executablePath: executablePath
    })
    let page = await browser.newPage();
    await page.goto('https://ava.sae.digital/login')
    //await page.waitForNavigation()
    await page.waitForTimeout(2000);
    page.type('#usuario', user)
    await page.waitForTimeout(2000);
    page.type('#senha', key)
    await page.waitForTimeout(2000);
    page.click('#btnEntrar')
    await page.waitForNavigation()
    // https://ava.sae.digital/trilha/objetiva/9/matematica/livro-1/potencias/11/46033
    // https://ava.sae.digital/trilha/dados_questoes_objetivas/9/matematica/livro-1/potencias/11
    let urlJson = avaUrl.replace('objetiva', 'dados_questoes_objetivas')
                        .replace('/' + avaUrl.split('/')[10], '')
    await page.goto(urlJson)
    let json = await page.evaluate(() => {
        return JSON.parse(document.body.innerText)
    })
    await browser.close()
    return json as IAvaTrilhasResponse
};