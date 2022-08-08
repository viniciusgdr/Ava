import axios from "axios";

export async function makeActivitesAprovaMais(
    token: string, 
    listUrl: string[]
) {
    let allResults: {
        error?: boolean | any,
        success?: boolean,
        question: AprovaMaisQuestion.Questions
    }[][] = []
    for (let i = 0; i < listUrl.length; i++) {
        let subjectSlug = listUrl[i].split('/')[5]
        let moduleSlug = listUrl[i].split('/')[6]
        let id = listUrl[i].split('/')[7]
        let fetchNewId = await axios.get(`https://apis.sae.digital/ava/aprova-mais/module?subjectSlug=${subjectSlug}&moduleSlug=${moduleSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }) as {
            data: AprovaMaisCard
        }
        let exists = fetchNewId.data.card.find((value) => value.id == Number(id))
        if (exists) {
            let data = await axios.get(`https://apis.sae.digital/ava/aprova-mais/question?cardId=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            let res = data.data as {
                card: AprovaMaisQuestion.Card,
                questions: AprovaMaisQuestion.Questions[],
                subject: AprovaMaisQuestion.Subject,
                module: AprovaMaisQuestion.Module
            }
            let results: {
                error?: boolean | any,
                success?: boolean,
                question: AprovaMaisQuestion.Questions
            }[] = []
            for (let i = 0; i < res.questions.length; i++) {
                let respostaCorretaIndex = res.questions[i].choices.findIndex((value) => value.correct_answer == 1)
                let response = await sendAnswerQuestionAprovaMais(
                    token,
                    res.questions[i].card_item_id,
                    id,
                    respostaCorretaIndex
                )
                if ('error' in response.data) {
                    results.push({
                        error: response.data.error,
                        question: res.questions[i]
                    })
                } else {
                    results.push({
                        success: true,
                        question: res.questions[i]
                    })
                }
            }
            allResults.push(results)
        } else {
            allResults.push([])
        }
    }
    return allResults
}
async function sendAnswerQuestionAprovaMais(token: string, cardItemId: number, cardId: string, answerSelect: number) {
    return await axios.post('https://apis.sae.digital/ava/aprova-mais/answer-question', {
        answerSelect,
        cardId,
        cardItemId
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}
export namespace AprovaMaisQuestion {
    export interface Card {
        difficulty: number;
        score: {
            points: number;
            percentage: number;
        }
    }
    export interface Subject {
        name: string;
        slug: string;
        code: number;
    }
    export interface Module {
        name: string;
        slug: string;
        code: number;
        full_title: string;
        book: {
            slug: string;
            code: number;
        }
    }
    export interface Questions {
        card_item_id: number;
        question_id: number;
        title: string;
        stem: string;
        choices: {
            id: number;
            text: string;
            selected: boolean;
            correct_answer: number;
        }[];
        answered: boolean;
    }
}
export interface AprovaMaisCard {
    trail: {
        name: string,
        slug: string,
        code: number
    },
    module: {
        full_title: string,
        code: number,
        title: string,
        slug: string,
        book: {
            slug: string,
            code: number,
        },
        name: string,
        average: {
            total: number,
            percentage: number
        },
        experience: {
            current: number,
            max: number
        }, 
        trophies: {
            best: boolean,
            gold: boolean,
            silver: boolean,
            bronze: boolean
        }
    }
    card: {
        id: number,
        progress: number,
        difficulty: number,
        score: {
            points: number,
            percentage: number
        }, 
        rank_status: string,
        achievement: {
            score: number,
            type: number
        }
        ended: string
    }[]
}