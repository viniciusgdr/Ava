import axios from "axios";
import { getData } from "../structures/Activites";
import { Token } from './../structures/Token';

export async function getAllVideosFromSubject(teamId: string, token: string, subject: string) {
    let result = await axios.get(`https://apis.sae.digital/ava/learning-path/list?subject=${subject}&teamId=${teamId}&lpType=VD`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
        }
    })
    let resultTE = await axios.get(`https://apis.sae.digital/ava/learning-path/list?subject=${subject}&teamId=${teamId}&lpType=TE`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
        }
    })
    let resultRF = await axios.get(`https://apis.sae.digital/ava/learning-path/list?subject=${subject}&teamId=${teamId}&lpType=RF`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
        }
    })
    let data = result.data.data[result.data.data.length - 1]
    let dataTE = resultTE.data.data[resultTE.data.data.length - 1]
    let dataRF = resultRF.data.data[resultRF.data.data.length - 1]
    let urlPath = `https://ava.sae.digital/trilha/video/${result.data.grade}/${result.data.subject.slug}/${data.slug}`
    let urlPathTE = `https://ava.sae.digital/trilha/objetiva/${resultTE.data.grade}/${resultTE.data.subject.slug}/${dataTE.slug}`
    let urlPathRF = `https://ava.sae.digital/trilha/objetiva/${resultRF.data.grade}/${resultRF.data.subject.slug}/${dataRF.slug}`
    let all = []
    for (let i = 0; i < data.learning_paths.length; i++) {
        let id = data.learning_paths[i].id
        let slug = data.learning_paths[i].slug
        let schedulePeople = data.learning_paths[i].schedules[0].schedule_people.length == 0 ? null : data.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at == null ? null : data.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at

        let url = `${urlPath}/4/${teamId}/${id}/${slug}`
        if (schedulePeople == null) all.push(url)
    }
    for (let i = 0; i < dataTE.learning_paths.length; i++) {
        let id = dataTE.learning_paths[i].id
        let slug = dataTE.learning_paths[i].slug
        let schedulePeople = dataTE.learning_paths[i].schedules[0].schedule_people.length == 0 ? null : dataTE.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at == null ? null : dataTE.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at

        let url = `${urlPathTE}/1/${teamId}/${id}/${slug}`
        let urlAPI = `https://apis.sae.digital/ava/escola-digital/jarvis/trilha?grade=${resultTE.data.grade}&subject=${resultTE.data.subject.slug}&book=${dataTE.slug}&learning_path_slug=${slug}&card_type=1&learning_path_id=${id}`
        let dataAPI = await getData(urlAPI, token)
        if (schedulePeople == null && !dataAPI.data.expired && !dataAPI.data.can_see_answer) all.push(url)
    }
    for (let i = 0; i < dataRF.learning_paths.length; i++) {
        let id = dataRF.learning_paths[i].id
        let slug = dataRF.learning_paths[i].slug
        let schedulePeople = dataRF.learning_paths[i].schedules[0].schedule_people.length == 0 ? null : dataRF.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at == null ? null : dataRF.learning_paths[i].schedules[0].schedule_people[0].main_track_finished_at

        let url = `${urlPathRF}/11/${teamId}/${id}/${slug}`
        let urlAPI = `https://apis.sae.digital/ava/escola-digital/jarvis/trilha?grade=${resultRF.data.grade}&subject=${resultRF.data.subject.slug}&book=${dataRF.slug}&learning_path_slug=${slug}&card_type=11&learning_path_id=${id}`
        let dataAPI = await getData(urlAPI, token)
        if (schedulePeople == null && !dataAPI.data.expired && !dataAPI.data.can_see_answer) all.push(url)
    }
    return all
};
export async function getAllMateries(token: string) {
    let tokenAssitance = new Token(token)
    let result = await axios.get(`https://apis.sae.digital/ava/learning-path/list-by-student-id?studentId=${tokenAssitance.personId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
        }
    })
    let act = result.data.filter((activite) => Number(activite.count_pending) > 0)
    let videosPending = [] as string[]
    for (let i = 0; i < act.length; i++) {
        let videos = await getAllVideosFromSubject(act[i].team_id, token, act[i].slug)
        console.log(videos)
        if (videos.length > 0) videosPending.push(...videos)
    }
    return videosPending
};