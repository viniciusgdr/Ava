import { ActivitesData } from "."

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