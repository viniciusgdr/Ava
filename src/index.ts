import puppeteer from 'puppeteer';
import { avaLogin } from './functions/login';
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
    public async makeActivites(cobaiaUser: string, cobaiaPassword: string) {
        if (!cobaiaUser) throw new Error('Send the cobaiaUser')
        if (!cobaiaPassword) throw new Error('Send the cobaiaPassword')

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                height: 600,
                width: 800
            }
        })
        let tokenMe = await avaLogin(browser, this.user, this.password)
        const browser2 = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                height: 600,
                width: 800
            }
        })
        let token2 = await avaLogin(browser2, cobaiaUser, cobaiaPassword)
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
        let login = await avaLogin(browser, this.user, this.password)
        const browser2 = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                height: 600,
                width: 800
            }
        })
        await avaLogin(browser2, cobaiaUser, cobaiaPassword)
        await makeActivitesByMeLogin(browser, browser2, this.arrayVideos, login.token)
    }
    public async readAula() {
        console.log('| Inicializando navegador - Realizando Login...')
        const browser = await puppeteer.launch({
            executablePath: process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome',
        })
        let login = await avaLogin(browser, this.user, this.password)
        console.log('| Login realizado com sucesso! - Iniciando aula...')
        for (let i = 0; i < this.arrayVideos.length; i++) await readAvaVideo(browser, this.arrayVideos[i], login.token);
        await browser.close();
    }
}