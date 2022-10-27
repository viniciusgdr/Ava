import puppeteer from 'puppeteer';
import { getstr } from '../utils/getHtml';
import fetch from 'node-fetch';
import { url as URL } from './../Defaults/url';
import { Cookie } from '../interfaces/Cookie';
async function getVideoSecondsVimeo(url: string) {
    let request = await fetch(url)
    let html = await request.text()
    let str = getstr(html, '"duration":', ',', 0)
    return Number(str)
};
export async function readAvaVideo(browser: puppeteer.Browser, url: string, auth: string, cookie: string) {
    let html: string = ''
    if (cookie == '' || !cookie) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        await page.waitForSelector('iframe');
        html = await page.content();
    } else {
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
                "cookie": cookie,
                "Referer": "https://ava.sae.digital/curricular_component?team=46033&subject=lingua-portuguesa",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        html = await request.text()
    }


    let learningPathId = getstr(html, "const learningPathId = '", "'", 0);
    let learningPathItemId = getstr(html, "const learningPathItemId = '", "'", 0);
    let scheduleId = getstr(html, "const scheduleId = '", "'", 0);
    let urlVideo = getstr(html, 'id="ava-video-container" src="', '"', 0);
    let videoTimeInSeconds = await getVideoSecondsVimeo(urlVideo)
    console.log(urlVideo, videoTimeInSeconds)
    await fetch(URL.videoRequest, {
        method: "POST",
        headers: {
            'authorization': 'Bearer ' + auth,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            'learning_path_id': learningPathId,
            'learning_path_item_id': learningPathItemId,
            'schedule_id': scheduleId,
            'video_percentage': 100,
            'video_time': videoTimeInSeconds
        })
    })
    return {
        timeVideo: videoTimeInSeconds,
        seconds: videoTimeInSeconds,
        bodyRequest: {
            'learning_path_id': learningPathId,
            'learning_path_item_id': learningPathItemId,
            'schedule_id': scheduleId,
            'video_percentage': 100,
            'video_time': videoTimeInSeconds
        }
    }
}