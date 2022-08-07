import puppeteer from 'puppeteer';
import { readAvaVideo } from './functions/readAvaVideo';
import { makeActivitesByMeLogin } from './functions/realizeAct';
import { realizeAllActivites } from './functions/realizeActivites';
require('dotenv').config()

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
    }
    /**
     * 
     * @param cobaiaUser - The user of the cobaia
     * @param cobaiaPassword - The password of the cobaia
     * @param options - Options for the method
     * @returns
     */
    public async makeActivites(cobaiaUser: string, cobaiaPassword: string, options?: {
        headless: boolean
    }) {
        if (!cobaiaUser) throw new Error('Send the cobaiaUser')
        if (!cobaiaPassword) throw new Error('Send the cobaiaPassword')

        const browser = await this.generateNewBrowser(options)
        let tokenMe = await this.avaLogin(browser, this.user, this.password)
        const browser2 = await this.generateNewBrowser(options)
        let token2 = await this.avaLogin(browser2, cobaiaUser, cobaiaPassword)
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
        headless: boolean,
        chromePath: string
    }) {
        const browser = await this.generateNewBrowser(options)
        let login = await this.avaLogin(browser, this.user, this.password)
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
            let result = await readAvaVideo(browser, this.arrayVideos[i], login.token);
            results.push(result)
        }
        await browser.close();
        return results
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
        await page.close()
        return {
            page,
            html,
            token
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