import puppeteer from 'puppeteer';
import { getHtmlJson } from '../utils/getHtml';
import { goToActivites } from '../interfaces/activites';
export type ITypeLp = 'RF' | 'TE'
export async function goToActivites(browser: puppeteer.Browser, team: string | number, subject: string, token: string, type: ITypeLp): Promise<goToActivites> {
    let page = await browser.newPage()
    page.setExtraHTTPHeaders({
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
    })
    await page.goto(`https://apis.sae.digital/ava/learning-path/list?subject=${subject}&teamId=${team}&lpType=${type}`)
    await page.waitForTimeout(2000)
    let json = await getHtmlJson(page)
    await page.close()
    return json
}