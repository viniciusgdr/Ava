import puppeteer from 'puppeteer';
import { getstr } from '../utils/getHtml';
import request from 'request';
export async function readAvaVideo(browser: puppeteer.Browser, url: string, auth: string) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await page.waitForSelector('iframe');
    let html = await page.content();
    let learningPathId = getstr(html, "const learningPathId = '", "'", 0);
    let learningPathItemId = getstr(html, "const learningPathItemId = '", "'", 0);
    let scheduleId = getstr(html, "const scheduleId = '", "'", 0);
    let urlVideo = getstr(html, 'id="ava-video-container" src="', '"', 0);
    let videoTime;
    try {
        await page.waitForTimeout(1000);
        videoTime = await page.evaluate("document.getElementsByClassName('box')[1].innerHTML")
    } catch (err) {
        await page.goto(urlVideo, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        videoTime = await page.evaluate("document.getElementsByClassName('box')[1].innerHTML")
    }
    await page.close()
    let seconds = videoTime.split(':')
    let secondsTotal = (parseInt(seconds[0]) * 60) + parseInt(seconds[1])
    request({
        'url': 'https://apis.sae.digital/ava/answer/video',
        'method': 'POST',
        'headers': {
            'authorization': 'Bearer ' + auth,
            'content-type': 'application/json'
        },
        'body': JSON.stringify({
            'learning_path_id': learningPathId,
            'learning_path_item_id': learningPathItemId,
            'schedule_id': scheduleId,
            'video_percentage': 100,
            'video_time': secondsTotal
        })
    }, (error, res, body) => {
        if (error) throw new Error('Erro ao enviar resposta video: ' + error);
    })
    return {
        timeVideo: videoTime,
        seconds: secondsTotal,
        bodyRequest: {
            'learning_path_id': learningPathId,
            'learning_path_item_id': learningPathItemId,
            'schedule_id': scheduleId,
            'video_percentage': 100,
            'video_time': secondsTotal
        }
    }
}