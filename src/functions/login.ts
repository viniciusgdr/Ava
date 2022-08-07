import puppeteer from 'puppeteer';

export async function avaLogin(browser: puppeteer.Browser, user: string, password: string) {
    let page = await browser.newPage()
    await page.goto('https://ava.sae.digital/login')
    await page.waitForTimeout(1000)
    await page.type('#usuario', user)
    await page.waitForTimeout(1000)
    await page.type('#senha', password)
    await page.waitForTimeout(1000)
    await page.click('#btnEntrar')
    await page.waitForNavigation()

    let html = await page.content()
    let token: string = await page.evaluate('getCookieServices.userToken')
    await page.close()
    return {
        page,
        html,
        token
    }
}