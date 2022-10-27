import { Browser } from "puppeteer";
import { getstr } from "../utils/getHtml";
import { url as URL } from './../Defaults/url';
import fetch from 'node-fetch';
import { htmlAVA } from "./HtmlAVA";
async function getVideoSecondsVimeo(url: string) {
    let request = await fetch(url)
    let html = await request.text()
    let str = getstr(html, '"duration":', ',', 0)
    return Number(str)
};
export class Video {
    html: string;
    constructor(
        private readonly browser: Browser,
        private readonly user: {
            auth: string,
            cookie?: string
        }
    ) {

    }
    async getHtmlVideoByBrowser(url: string) {
        const page = await this.browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        await page.waitForSelector('iframe');
        this.html = await page.content();
    }
    async getHtmlVideoByFetch(url: string) {
        let request = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "pt-BR,pt;q=0.9,en;q=0.8,pt-PT;q=0.7",
                "cache-control": "max-age=0",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": this.user.cookie,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        this.html = await request.text()
    }
    async read(url: string) {
        if (!this.user?.cookie) await this.getHtmlVideoByBrowser(url)
        else await this.getHtmlVideoByFetch(url)

        let htmlVideo = new htmlAVA(this.html)
        let videoTimeInSeconds = await getVideoSecondsVimeo(htmlVideo.urlVideo)
        console.log(htmlVideo.urlVideo, videoTimeInSeconds)

        let bodyRequest = {
            'learning_path_id': htmlVideo.learningPathId,
            'learning_path_item_id': htmlVideo.learningPathItemId,
            'schedule_id': htmlVideo.scheduleId,
            'video_percentage': 100,
            'video_time': videoTimeInSeconds
        }
        await fetch(URL.videoRequest, {
            method: "POST",
            headers: {
                'authorization': 'Bearer ' + this.user.auth,
                'content-type': 'application/json'
            },
            body: JSON.stringify(bodyRequest)
        })
        return {
            timeVideo: videoTimeInSeconds,
            seconds: videoTimeInSeconds,
            bodyRequest
        }
    }
};