import axios from 'axios';
import puppeteer from 'puppeteer';
import { readAvaVideo } from './readAvaVideo';
import { ActivitesAPIResult, IQuestions, IResultsActivites } from './../interfaces';

interface IRealizeAllActivites {
    token2: string,
    needListUrl: string[]
}
async function sendPostAnswer(answer: string, cardTypeId: string, learningPathId: string, learningPathItemId: string, random: string[] | number[], schedule_id: string | number, token: string) {
    return await axios.post('https://apis.sae.digital/ava/answer/question', {
        answer: Number(answer),
        card_type_id: Number(cardTypeId),
        learning_path_id: Number(learningPathId),
        learning_path_item_id: Number(learningPathItemId),
        random: random,
        schedule_id: Number(schedule_id)
    }, {
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json'
        }
    })
}
async function getData(url: string, token: string) {
    try {
        return await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })
    } catch (err) {
        throw new Error(err)
    }
}
export async function realizeAllActivites(browser: puppeteer.Browser, token: string, {
    token2,
    needListUrl
}: IRealizeAllActivites) {
    let arrayUrlActivites = [] as string[]
    if (needListUrl.length > 0) {
        arrayUrlActivites = needListUrl
    } else {
        return []
    }
    let allResults = [] as IResultsActivites[][]
    for (let i = 0; i < arrayUrlActivites.length; i++) {
        try {
            let trilhaWeb = arrayUrlActivites[i].split('/')
            let url = `https://apis.sae.digital/ava/escola-digital/jarvis/trilha?grade=${trilhaWeb[5]}&subject=${trilhaWeb[6]}&book=${trilhaWeb[7]}&learning_path_slug=${trilhaWeb[11]}&card_type=${trilhaWeb[8]}&learning_path_id=${trilhaWeb[10]}`

            let data: {
                data: ActivitesAPIResult
            } = await getData(url, token2)
            let dataMe = await getData(url, token)
            let questions = data.data.questions as IQuestions[]
            let schedule_id = data?.data?.learning_path?.schedules[0]?.id
            if (schedule_id == undefined) throw new Error('Não foi possível encontrar o schedule_id')
            let results: IResultsActivites[] = []
            questions.forEach(async (value, index) => {
                let learningPathItemId = String(value.learning_path_item_id)
                let originalIndex = value.choices.map((value) => value.originalIndex)
                let random = Math.floor(Math.random() * 2) + 2
                let cobaia = await sendPostAnswer(String(random), trilhaWeb[8], trilhaWeb[10], learningPathItemId, originalIndex, schedule_id, token2)
                if ('message' in cobaia.data) {
                    if (data.data.can_see_answer) {
                        let correct = value.choices.find((value) => value.correct_answer == 1)
                        if (correct) {
                            let idCobaia = correct.id

                            let randola = dataMe.data.questions.findIndex((value) => value.learning_path_item_id == learningPathItemId)
                            console.log(randola)

                            let idMinha = dataMe.data.questions[randola].choices.find((value) => value.id == idCobaia)
                            let myOriginalIndex = dataMe.data.questions[randola].choices.map((value) => value.originalIndex)
                            console.log(idCobaia, idMinha, myOriginalIndex)
                            let me = await sendPostAnswer(idMinha.originalIndex, trilhaWeb[8], trilhaWeb[10], learningPathItemId, myOriginalIndex, schedule_id, token)
                            console.log('Resultado', me.data)
                            if (trilhaWeb[8] == '1') {
                                let urlVideo = arrayUrlActivites[i].replace('/objetiva/', '/video/').replace('/1/', '/4/')
                                await readAvaVideo(browser, urlVideo, token)
                            }
                        } else {
                            console.log('Não foi possível encontrar a resposta correta')
                        }
                    }
                } else {
                    let idCobaia = value.choices.find((value) => value.originalIndex == Number(cobaia.data.correct_answer) - 1).id

                    let randola = dataMe.data.questions.findIndex((value) => value.learning_path_item_id == learningPathItemId)
                    let idMinha = dataMe.data.questions[randola].choices.find((value) => value.id == idCobaia)
                    let myOriginalIndex = dataMe.data.questions[randola].choices.map((value) => value.originalIndex)
                    let me = await sendPostAnswer(idMinha.originalIndex, trilhaWeb[8], trilhaWeb[10], learningPathItemId, myOriginalIndex, schedule_id, token)
                    results.push(me.data)
                    if (trilhaWeb[8] == '1') {
                        let urlVideo = arrayUrlActivites[i].replace('/objetiva/', '/video/').replace('/1/', '/4/')
                        await readAvaVideo(browser, urlVideo, token)
                    }
                }
            })
            allResults.push(results)
        } catch (err) {
            allResults.push([])
        }
    }
    return allResults
}