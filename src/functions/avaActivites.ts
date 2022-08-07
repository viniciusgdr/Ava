import puppeteer from 'puppeteer';
import { getHtmlJson } from '../utils/getHtml';

interface IAvaActivites {
    id: number;
    name: string;
    slug: string;
    count: string;
    team_id: number;
    team_name: string;
}
export async function avaActivites(browser: puppeteer.Browser, personId: string, token: string): Promise<IAvaActivites[]> {
    let url = 'https://apis.sae.digital/ava/learning-path/list-by-student-id?studentId=' + personId;
    let page = await browser.newPage();
    page.setExtraHTTPHeaders({
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
    })
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    let json = await getHtmlJson(page)
    await page.close()
    return json
}