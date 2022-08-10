import puppeteer from 'puppeteer';
import { makeActivitesAprovaMais, AprovaMaisQuestion } from './functions/aprovaMais';
import { getAllMateries } from './functions/getAllVideosFromSubject';
import { readAvaVideo } from './functions/readAvaVideo';
import { makeActivitesByMeLogin } from './functions/realizeAct';
import { getData, realizeActivite } from './functions/realizeActivites';
import { ActivitesAPIResult, IResultsActivites } from './interfaces';
import { checkUrl } from './utils/checkUrl';
import { getstr } from './utils/getHtml';

const DEFAULT_CHROME_PATH = process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : process.platform == 'linux' ? '/usr/bin/google-chrome' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export * from './functions';
export class Ava {
    constructor(
        private user: string,
        private password: string,
        private arrayVideos?: string[]
    ) {
        if (!user) throw new Error('Send the user on the constructor')
        if (!password) throw new Error('Send the password on the constructor')
        //if (!arrayVideos) throw new Error('Send the arrayVideos on the constructor')
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
            tokenUser: string,
            personId: string
        }
    }) {
        if (!this.arrayVideos && type == 'aprova-mais') throw new Error('Send the arrayVideos on the constructor')

        const browser = options?.puppeteer.browser || await this.generateNewBrowser({
            headless: false,
            chromePath: DEFAULT_CHROME_PATH
        })
        let login = options?.loginUser ? {
            token: options.loginUser.tokenUser,
            personId: options.loginUser.personId
        } : await this.avaLogin(browser, this.user, this.password)

        if (type == 'aprova-mais') {
            if (!options?.puppeteer.browser) await browser.close()
            let res = await makeActivitesAprovaMais(login.token, this.arrayVideos)
            return res
        } else {
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
            if (this.arrayVideos.length > 0) {
                for (let i = 0; i < this.arrayVideos.length; i++) {
                    if (!checkUrl(this.arrayVideos[i], 'video')) throw new Error('The url is not a video')
                    let result = await readAvaVideo(browser, this.arrayVideos[i], login.token);
                    results.push(result)
                }
                await browser.close();
                return results
            } else {
                let result = await getAllMateries(login.token, login.personId)
                let results = []
                for (let i = 0; i < result.length; i++) {
                    let video: string = result[i]
                    if (checkUrl(video, 'video')) {
                        let resultado = await readAvaVideo(browser, video, login.token);
                        results.push(resultado)
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
            tokenUser: string,
            personId: string
        }
        loginAnotherUser?: {
            tokenAnotherUser: string,
            personIdAnotherUser: string,
        }
    }): Promise<IResultsActivites[] | {
        message: any;
    }[]> {
        const browser = options?.puppeteer.browser || await this.generateNewBrowser({
            headless: false,
        })
        const browserCobaia = await this.generateNewBrowser(options?.puppeteer)
        const { token, personId } = options?.loginUser ? {
            token: options.loginUser.tokenUser,
            personId: options.loginUser.personId
        } : await this.avaLogin(browser, this.user, this.password)

        const { token: tokenAnotherUser, personId: personIdAnotherUser } = options?.loginAnotherUser ? {
            token: options.loginAnotherUser.tokenAnotherUser,
            personId: options.loginAnotherUser.personIdAnotherUser
        } : await this.avaLogin(browserCobaia, user, password)

        if (this.arrayVideos) {
            let results = []
            for (let i = 0; i < this.arrayVideos.length; i++) {
                const video = this.arrayVideos[i]
                if (checkUrl(video, 'video')) {
                    let resultado = await readAvaVideo(browser, video, token);
                    results.push(resultado)
                } else if (checkUrl(video, 'aprova-mais')) {
                    let resultado = await makeActivitesAprovaMais(token, [video]);
                    results.push(resultado)
                } else {
                    let result = await realizeActivite(browser, token, {
                        token2: tokenAnotherUser,
                        urlRequest: video
                    })
                    results.push(result)
                }
            }
            if (!options?.puppeteer.browser) {
                await browser.close()
            }
            await browserCobaia.close()
            return results
        } else {
            let result = await getAllMateries(token, personId)
            let resultCobaia = await getAllMateries(tokenAnotherUser, personIdAnotherUser)

            let results = []
            for (let i = 0; i < result.length; i++) {
                let video: string = result[i]
                if (resultCobaia.includes(video)) {
                    if (checkUrl(video, 'video')) {
                        let resultado = await readAvaVideo(browser, video, token);
                        results.push(resultado)
                    } else if (checkUrl(video, 'aprova-mais')) {
                        let resultado = await makeActivitesAprovaMais(token, [video]);
                        results.push(resultado)
                    } else {
                        await realizeActivite(browser, token, {
                            token2: tokenAnotherUser,
                            urlRequest: video
                        })
                    }
                } else {
                    if (checkUrl(result[i], 'video')) {
                        let resultado = await readAvaVideo(browser, result[i], token);
                        results.push(resultado)
                    } else if (checkUrl(result[i], 'aprova-mais')) {
                        let resultado = await makeActivitesAprovaMais(token, [result[i]]);
                        results.push(resultado)
                    } else {
                        let data: {
                            data: ActivitesAPIResult
                        } = await getData(result[i], tokenAnotherUser)
                        if (data.data.can_see_answer) {
                            await realizeActivite(browser, token, {
                                token2: tokenAnotherUser,
                                urlRequest: result[i]
                            })
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