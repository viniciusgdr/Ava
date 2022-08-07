import { ILearningPaths } from ".";

export interface ActivitesData {
    "id": number,
    "name": string,
    "short_name": string,
    "slug": string,
    "index": number,
    "learning_paths": ILearningPaths[]
}