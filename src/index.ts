import puppeteer from 'puppeteer';
import { getAllMateries } from './functions/getAllVideosFromSubject';
import { readAvaVideo } from './functions/readAvaVideo';
import { makeActivitesByMeLogin } from './functions/realizeAct';
import { realizeAllActivites } from './functions/realizeActivites';
import { IResultsActivites } from './interfaces';
import { getstr } from './utils/getHtml';
require('dotenv').config()

export * from './functions';
export class Ava {
    constructor(
        public user: string,
        public password: string,
        public arrayVideos: string[]
    ) {
        if (!user) throw new Error('Send the user on the constructor')
        if (!password) throw new Error('Send the password on the constructor')
        if (!arrayVideos) throw new Error('Send the arrayVideos on the constructor')
        this.user = user
        this.password = password
        this.arrayVideos = arrayVideos
    }
    /**
     * 
     * @param cobaiaUser - The user of the cobaia
     * @param cobaiaPassword - The password of the cobaia
     * @param options - Options for the method
     * @returns
     */
    public async makeActivites(cobaiaUser: string, cobaiaPassword: string, options?: {
        headless?: boolean,
        browser?: puppeteer.Browser,
        browserCobaia?: puppeteer.Browser,
        useToken?: string,
        useTokenCobaia?: string
    }) {
        if (!cobaiaUser) throw new Error('Send the cobaiaUser')
        if (!cobaiaPassword) throw new Error('Send the cobaiaPassword')

        const browser = options?.browser || await this.generateNewBrowser(options)
        let tokenMe = options?.useToken ? {
            token: options.useToken
        } : await this.avaLogin(browser, this.user, this.password)
        const browser2 = options?.browserCobaia || await this.generateNewBrowser(options)
        let token2 = options?.useTokenCobaia ? {
            token: options.useTokenCobaia
        } : await this.avaLogin(browser, this.user, this.password)
        let result = await realizeAllActivites(browser, tokenMe.token, {
            token2: token2.token,
            needListUrl: this.arrayVideos
        })
        await browser.close()
        await browser2.close()
        return result
    }
    /**
    * @param {string} cobaiaUser - The user of the cobaia
    * @param {string} cobaiaPassword - The password of the cobaia
    * @deprecated - This method is deprecated, use makeActivites instead
    */
    public async makeActivitesByAnotherLogin(
        cobaiaUser: string,
        cobaiaPassword: string,
    ) {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                height: 600,
                width: 800
            }
        })
        let login = await this.avaLogin(browser, this.user, this.password)
        const browser2 = await this.generateNewBrowser()
        await this.avaLogin(browser2, cobaiaUser, cobaiaPassword)
        await makeActivitesByMeLogin(browser, browser2, this.arrayVideos, login.token)
    }
    public async readAula(options?: {
        headless?: boolean,
        chromePath?: string,
        useToken?: string,
        browser?: puppeteer.Browser
    }) {
        const browser = options?.browser || await this.generateNewBrowser(options)
        let login = options?.useToken ? {
            token: options.useToken
        } : await this.avaLogin(browser, this.user, this.password)
        let results: {
            timeVideo: number;
            seconds: number;
            bodyRequest: {
                learning_path_id: number;
                learning_path_item_id: number;
                schedule_id: number;
                video_percentage: number;
                video_time: number;
            };
        }[] = []
        for (let i = 0; i < this.arrayVideos.length; i++) {
            if (!this.checkUrl(this.arrayVideos[i], 'video')) throw new Error('The url is not a video')
            let result = await readAvaVideo(browser, this.arrayVideos[i], login.token);
            results.push(result)
        }
        await browser.close();
        return results
    }
    public checkUrl(url: string, type: 'video' | 'trilha' | 'reforco') {
        if (type == 'video') {
            // https://ava.sae.digital/trilha/video/9/matematica/videoaulas-livro-3/4/XXXXX/XXXX/organizacao-leitura-e-interpretacao-aula-01
            let urlSplited = url.split('/')
            if (urlSplited[3] == 'trilha' && urlSplited[4] == 'video') {
                return true
            } else return false
        } else if (type == 'trilha') {
            // https://ava.sae.digital/trilha/objetiva/9/matematica/livro-3/1/XXXXX/XXXX/organizacao-leitura-e-interpretacao
            let urlSplited = url.split('/')
            if (urlSplited[3] == 'trilha' && urlSplited[4] == 'objetiva' && urlSplited[8] == '1') {
                return true
            } else return false
        } else if (type == 'reforco') {
            // https://ava.sae.digital/trilha/objetiva/9/matematica/livro-3/11/XXXXX/XXXX/medidas-de-tendencia-central-e-de-dispersao
            let urlSplited = url.split('/')
            if (urlSplited[3] == 'trilha' && urlSplited[4] == 'objetiva' && urlSplited[8] == '11') {
                return true
            } else return false
        }
    }
    public async realizeAllActivitesFromAVA(cobaiaUser: string, cobaiaPassword: string, options?: {
        headless?: boolean,
        chromePath?: string,
        useToken?: string,
        useTokenCobaia?: string,
        browser?: puppeteer.Browser,
        browserCobaia?: puppeteer.Browser,
        personId?: string,
        personIdCobaia?: string
    }) {
        if (!cobaiaUser) throw new Error('Send the cobaiaUser')
        if (!cobaiaPassword) throw new Error('Send the cobaiaPassword')

        const browser = options?.browser || await this.generateNewBrowser(options)
        const browserCobaia = options?.browserCobaia || await this.generateNewBrowser(options)
        let login = options?.useToken && options?.personId ? {
            token: options.useToken,
            personId: options.personId
        } : await this.avaLogin(browser, this.user, this.password)
        let loginCobaia = options?.useToken && options?.personIdCobaia ? {
            token: options.useTokenCobaia,
            personId: options.personIdCobaia
        } : await this.avaLogin(browser, this.user, this.password)

        let result = await getAllMateries(login.token, login.personId)
        let resultCobaia = await getAllMateries(loginCobaia.token, loginCobaia.personId)

        let resultDivergentVideos = []
        for (let i = 0; i < result.length; i++) {
            if (resultCobaia.includes(result[i])) {
                resultDivergentVideos.push(result[i])
            }
        }
        let allResults: any = []
        for (let i = 0; i < resultDivergentVideos.length; i++) {
            if (this.checkUrl(resultDivergentVideos[i], 'video')) {
                let videoResult = await readAvaVideo(browser, resultDivergentVideos[i], login.token)
                allResults.push(videoResult)
            } else {
                let res = await realizeAllActivites(browser, login.token, {
                    token2: loginCobaia.token,
                    needListUrl: resultDivergentVideos[i]
                })
                allResults.push(res)
            }
        }
        await browser.close()
        await browserCobaia.close()
        return allResults
    }
    private async avaLogin(browser: puppeteer.Browser, user: string, password: string) {
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
        let personId = getstr(html, 'personId = ', ';', 0)
        await page.close()
        return {
            token: token,
            personId: personId
        }
    }
    private async generateNewBrowser(options?: {
        headless?: boolean,
        chromePath?: string
    }) {
        const browser = await puppeteer.launch({
            headless: options?.headless || false,
            executablePath: options?.chromePath || process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome',
            defaultViewport: {
                height: 600,
                width: 800
            }
        })
        return browser
    }
};