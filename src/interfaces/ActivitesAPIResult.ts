import { ILearningPaths, IQuestions } from ".";

export interface ActivitesAPIResult {
    expired: boolean;
    isStudent: boolean;
    can_answer: boolean;
    can_see_answer: boolean;
    learning_path: ILearningPaths;
    questions: IQuestions[]
}