import { Browser } from "puppeteer";
import axios from "axios";
import { ActivitesAPIResult, IQuestions, IResultsActivites } from "../interfaces";
import { Video } from "./Video";

export async function getData(url: string, token: string) {
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
export class Activite {
    constructor(
        private readonly browser: Browser,
        private readonly user: {
            auth: string,
            cookie?: string
        },
        private readonly userCobaia: {
            auth: string
        }
    ) { }
    async sendPostAnswer(answer: string, cardTypeId: string, learningPathId: string, learningPathItemId: string, random: string[] | number[], schedule_id: string | number, token: string) {
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
    async read(urlRequest: string) {
        let trilhaWeb = urlRequest.split('/')
        let url = `https://apis.sae.digital/ava/escola-digital/jarvis/trilha?grade=${trilhaWeb[5]}&subject=${trilhaWeb[6]}&book=${trilhaWeb[7]}&learning_path_slug=${trilhaWeb[11]}&card_type=${trilhaWeb[8]}&learning_path_id=${trilhaWeb[10]}`

        let data: {
            data: ActivitesAPIResult
        } = await getData(url, this.userCobaia.auth)
        let dataMe = await getData(url, this.user.auth)
        let questions = data.data.questions as IQuestions[]
        let schedule_id = data?.data?.learning_path?.schedules[0]?.id

        if (data.data.expired) {
            if (trilhaWeb[8] == '1') await this.redirectVideo(urlRequest)
            return [
                {
                    message: 'Time Expired to realize this activity'
                }
            ]
        }
        if (schedule_id == undefined) throw new Error('Não foi possível encontrar o schedule_id')
        let results: IResultsActivites[] = []
        if (data.data.can_see_answer) {
            questions.forEach(async (value, index) => {
                let learningPathItemId = String(value.learning_path_item_id)
                let correct = value.choices.find((value) => value.correct_answer == 1)
                if (correct) {
                    let idCobaia = correct.id

                    let randola = dataMe.data.questions.findIndex((value) => value.learning_path_item_id == learningPathItemId)
                    let idMinha = dataMe.data.questions[randola].choices.find((value) => value.id == idCobaia)
                    let myOriginalIndex = dataMe.data.questions[randola].choices.map((value) => value.originalIndex)
                    console.log(idCobaia, idMinha, myOriginalIndex)
                    let me = await this.sendPostAnswer(idMinha.originalIndex, trilhaWeb[8], trilhaWeb[10], learningPathItemId, myOriginalIndex, schedule_id, this.user.auth)
                    console.log('Resultado', me.data)
                    results.push(me.data)
                } else {
                    console.log('Não foi possível encontrar a resposta correta')
                }
            })
        } else {
            questions.forEach(async (value, index) => {
                let learningPathItemId = String(value.learning_path_item_id)
                let originalIndex = value.choices.map((value) => value.originalIndex)
                let random = Math.floor(Math.random() * 2) + 2
                let cobaia = await this.sendPostAnswer(String(random), trilhaWeb[8], trilhaWeb[10], learningPathItemId, originalIndex, schedule_id, this.userCobaia.auth)
                if ('message' in cobaia.data) {
                    results.push({
                        answered_all_the_questions: false,
                        correct_answer: null,
                        reached_the_goal: null,
                        score: null,
                    })
                } else {
                    let idCobaia = value.choices.find((value) => value.originalIndex == Number(cobaia.data.correct_answer) - 1).id

                    let randola = dataMe.data.questions.findIndex((value) => value.learning_path_item_id == learningPathItemId)
                    let idMinha = dataMe.data.questions[randola].choices.find((value) => value.id == idCobaia)
                    let myOriginalIndex = dataMe.data.questions[randola].choices.map((value) => value.originalIndex)
                    let me = await this.sendPostAnswer(idMinha.originalIndex, trilhaWeb[8], trilhaWeb[10], learningPathItemId, myOriginalIndex, schedule_id, this.user.auth)
                    results.push(me.data)
                }
            })
        }
        if (trilhaWeb[8] == '1') {
            await this.redirectVideo(urlRequest)
        }
    }
    private async redirectVideo(urlRequest: string) {
        let urlVideo = urlRequest.replace('/objetiva/', '/video/').replace('/1/', '/4/')
        await new Video(this.browser, this.user).read(urlVideo)
    }
}