
export interface ILearningPaths {
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