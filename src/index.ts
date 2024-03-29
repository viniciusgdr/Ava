import puppeteer from 'puppeteer';
import { makeActivitesAprovaMais } from './functions/aprovaMais';
import { getAllMateries } from './functions/getAllVideosFromSubject';
import { ActivitesAPIResult, IResultsActivites } from './interfaces';
import { ResultActiviteMeLogin } from './interfaces/ResultActiviteMeLogin';
import { Activite, getData } from './structures/Activites';
import { Video } from './structures/Video';
import { checkUrl } from './utils/checkUrl';

const DEFAULT_CHROME_PATH = process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : process.platform == 'linux' ? '/usr/bin/google-chrome' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export * from './functions';

class Browser {
    constructor() { }

    async avaLogin(browser: puppeteer.Browser, user: string, password: string) {
        let page = await browser.newPage()
        await page.goto('https://ava.sae.digital/login')
        await page.waitForTimeout(1000)
        await page.type('#usuario', user)
        await page.waitForTimeout(500)
        await page.type('#senha', password)
        await page.waitForTimeout(500)
        await page.click('#btnEntrar')
        await page.waitForNavigation()

        let token: string = await page.evaluate('getCookieServices.userToken')
        let cookies = await page.cookies()
        let cookie: string = ''

        for (let i = 0; i < cookies.length; i++) {
            cookie += `${cookies[i].name}=${cookies[i].value}; `
        }
        await page.close()
        return {
            token,
            cookie
        }
    }
    async generateNewBrowser(options?: {
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
}
export class Ava extends Browser {
    constructor(
        private user: string,
        private password: string,
        private arrayVideos?: string[]
    ) {
        super();
        if (!user) throw new Error('Send the user on the constructor')
        if (!password) throw new Error('Send the password on the constructor')
        this.user = user
        this.password = password
        this.arrayVideos = arrayVideos
    }
    public async makeAulasByMeLogin(type: 'video' | 'aprova-mais', options?: {
        puppeteer?: {
            chromePath: string,
            browser: puppeteer.Browser,
            headless: boolean
        },
        loginUser?: {
            tokenUser: string
        }
    }) {
        if (!this.arrayVideos && type == 'aprova-mais') throw new Error('Send the arrayVideos on the constructor')

        const browser = options?.puppeteer.browser || await this.generateNewBrowser({
            headless: false,
            chromePath: DEFAULT_CHROME_PATH
        })
        let login = options?.loginUser ? {
            token: options.loginUser.tokenUser,
            cookie: undefined
        } : await this.avaLogin(browser, this.user, this.password)

        if (type == 'aprova-mais') {
            if (!options?.puppeteer.browser) await browser.close()
            let res = await makeActivitesAprovaMais(login.token, this.arrayVideos)
            return res
        } else {
            let results: ResultActiviteMeLogin[] = []
            if (this.arrayVideos.length > 0) {
                for (let i = 0; i < this.arrayVideos.length; i++) {
                    if (!checkUrl(this.arrayVideos[i], 'video')) throw new Error('The url is not a video')
                    let result = await new Video(browser, {
                        auth: login.token,
                        cookie: login.cookie
                    }).read(this.arrayVideos[i])
                    results.push(result)
                }
                await browser.close();
                return results
            } else {
                let result = await getAllMateries(login.token)
                let results = []
                for (let i = 0; i < result.length; i++) {
                    let video: string = result[i]
                    if (checkUrl(video, 'video')) {
                        let result = await new Video(browser, {
                            auth: login.token,
                            cookie: login.cookie
                        }).read(video)
                        results.push(result)
                    }
                }
            }
            return results
        }
    }
    /**
     * @description Realizar todas as atividades pendentes do usuário ou do array de videos
     * 
     * @param user {string} Usuário do ava
     * @param password {string} Senha do ava
     * @param options {object} Opções do puppeteer ou do ava
     */
    public async makeAulasByAnotherUser(user: string, password: string, options?: {
        puppeteer?: {
            chromePath: string,
            browser: puppeteer.Browser,
            headless: boolean
        },
        loginUser?: {
            tokenUser: string
        }
        loginAnotherUser?: {
            tokenAnotherUser: string
        }
    }): Promise<IResultsActivites[] | {
        message: any;
    }[]> {
        const browser = options?.puppeteer.browser || await this.generateNewBrowser({
            headless: false,
        })
        const browserCobaia = await this.generateNewBrowser(options?.puppeteer)
        const { token, cookie } = options?.loginUser ? {
            token: options.loginUser.tokenUser,
            cookie: undefined
        } : await this.avaLogin(browser, this.user, this.password)

        const { token: tokenAnotherUser } = options?.loginAnotherUser ? {
            token: options.loginAnotherUser.tokenAnotherUser
        } : await this.avaLogin(browserCobaia, user, password)

        if (this.arrayVideos) {
            let results = []
            for (let i = 0; i < this.arrayVideos.length; i++) {
                const video = this.arrayVideos[i]
                if (checkUrl(video, 'video')) {
                    let result = await new Video(browser, {
                        auth: token,
                        cookie
                    }).read(video)
                    results.push(result)
                } else if (checkUrl(video, 'aprova-mais')) {
                    let resultado = await makeActivitesAprovaMais(token, [video]);
                    results.push(resultado)
                } else {
                    let result = await new Activite(browser, {
                        auth: token,
                        cookie
                    }, {
                        auth: tokenAnotherUser
                    }).read(video)
                    results.push(result)
                }
            }
            if (!options?.puppeteer.browser) {
                await browser.close()
            }
            await browserCobaia.close()
            return results
        } else {
            let result = await getAllMateries(token)
            let resultCobaia = await getAllMateries(tokenAnotherUser)
            console.log(result, resultCobaia)
            let results = []
            for (let i = 0; i < result.length; i++) {
                let video: string = result[i]
                if (resultCobaia.includes(video)) {
                    if (checkUrl(video, 'video')) {
                        let result = await new Video(browser, {
                            auth: token,
                            cookie
                        }).read(video)
                        results.push(result)
                    } else if (checkUrl(video, 'aprova-mais')) {
                        let resultado = await makeActivitesAprovaMais(token, [video]);
                        results.push(resultado)
                    } else {
                        await new Activite(browser, {
                            auth: token,
                            cookie
                        }, {
                            auth: tokenAnotherUser
                        }).read(video)
                    }
                } else {
                    if (checkUrl(result[i], 'video')) {
                        let resultado = await new Video(browser, {
                            auth: token,
                            cookie
                        }).read(result[i])
                        results.push(resultado)
                    } else if (checkUrl(result[i], 'aprova-mais')) {
                        let resultado = await makeActivitesAprovaMais(token, [result[i]]);
                        results.push(resultado)
                    } else {
                        let data: {
                            data: ActivitesAPIResult
                        } = await getData(result[i], tokenAnotherUser)
                        if (data.data.can_see_answer) {
                            await new Activite(browser, {
                                auth: token,
                                cookie
                            }, {
                                auth: tokenAnotherUser
                            }).read(video)
                        } else {
                            results.push({
                                error: 'Não foi possivel realizar a atividade, pois o aluno não tem permissão para ver a resposta'
                            })
                        }
                    }
                }
            }
            if (!options?.puppeteer.browser) {
                await browser.close()
            }
            return results
        }
    }
};