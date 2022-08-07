import puppeteer from 'puppeteer';
import { getHtmlJson } from '../utils/getHtml';

interface ILearningPaths {
    "id": number,
    "name": string,
    "index": number,
    "slug": string,
    "learning_path_type": {
        "id": number,
        "name": string,
        "short_name": string
    },
    "schedules": [
        {
            "id": number,
            "start": string,
            "end": string,
            "created_at": string,
            "updated_at": string,
            "schedule_people": string[]
        }
    ]
}
interface ActivitesData {
    "id": number,
    "name": string,
    "short_name": string,
    "slug": string,
    "index": number,
    "learning_paths": ILearningPaths[]
}
export interface goToActivites {
    "school_goal": {
        "objective_goal": number,
        "video_goal": number
    },
    "subject": {
        "id": number,
        "name": string,
        "slug": string,
        "active": boolean,
        "created_at": string,
        "updated_at": null
    },
    "grade": number,
    "count": number,
    "data": ActivitesData[]
}
export type ITypeLp = 'RF' | 'TE'
export async function goToActivites(browser: puppeteer.Browser, team: string | number, subject: string, token: string, type: ITypeLp): Promise<goToActivites> {
    let page = await browser.newPage()
    page.setExtraHTTPHeaders({
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
    })
    await page.goto(`https://apis.sae.digital/ava/learning-path/list?subject=${subject}&teamId=${team}&lpType=${type}`)
    await page.waitForTimeout(2000)
    let json = await getHtmlJson(page)
    await page.close()
    return json
}