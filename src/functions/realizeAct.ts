import puppeteer from 'puppeteer';
import { getHtmlJson, getstr } from '../utils/getHtml';
import request from 'request';

export async function makeActivitesByMeLogin(
    browser: puppeteer.Browser,
    browserMe: puppeteer.Browser,
    listUrl: string[],
    token: string
) {
    for (let i = 0; i < listUrl.length; i++) {
        try {
            let url = listUrl[i]
            let page = await browser.newPage()
            let pageMe = await browserMe.newPage()
            let urlJson = url.replace('objetiva', 'dados_questoes_objetivas')
                .replace('/' + url.split('/')[10], '')
            await pageMe.goto(urlJson)
            await page.goto(listUrl[i])
            let json = await getHtmlJson(pageMe)
            if (typeof json != 'object') throw new Error('Não foi possível encontrar o json da atividade')
            if (!json.can_see_answer) throw new Error('Você não pode ver a resposta da atividade')

            let questions = json.questions
            let arr = []

            let html = await page.content();
            let cardTypeId = getstr(html, "const cardType = '", "'", 0);

            for (let i = 0; i < questions.length; i++) {
                let question = questions[i]
                let correctAnswer = question.choices.findIndex((value) => value.correct_answer == 1)
                let answer = correctAnswer == 0 ? 'A' : correctAnswer == 1 ? 'B' : correctAnswer == 2 ? 'C' : correctAnswer == 3 ? 'D' : correctAnswer == 4 ? 'E' : 'F'
                arr.push({
                    question: i + 1,
                    answer,
                    index: correctAnswer,
                    learning_path_item_id: question.learning_path_item_id
                })
                let body = JSON.stringify({
                    answer: Number(correctAnswer),
                    card_type_id: Number(cardTypeId),
                    learning_path_id: Number(json.learning_path.id),
                    learning_path_item_id: Number(question.learning_path_item_id),
                    schedule_id: Number(json.learning_path.schedules[0].id)
                })
                console.log(body)
                request({
                    url: 'https://apis.sae.digital/ava/answer/question',
                    method: "POST",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
                    },
                    body
                })
            }
            await page.close()
            await pageMe.close()
            console.log(arr)
        } catch (err) {
            console.log(err)
        }
    }
    await browser.close()
    await browserMe.close()
}