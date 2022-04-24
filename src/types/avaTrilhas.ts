export interface IShedules {
    "id": number;
    "created_at": string;
    "updated_at": string;
    "end": string;
}
export interface ILearningPath {
    "id": number;
    "name": string;
    "slug": string;
    "book": {
        "name": string;
        "slug": string;
        "subject_grade": {
            "id": number;
            "subject": {
                "id": number;
                "name": string;
                "slug": string;
            }
        }
    },
    "schedules": IShedules[];
}
export interface IChoices {
    "id": number;
    "text": string;
    "selected": boolean;
    "correct_answer": 0 | 1;
}
export interface IQuestions {
    "card_item_id": number;
    "jarvisItemId": number;
    "stem": string;
    "data_cadastro": string;
    "tag_name": string;
    "difficulty": number;
    "student_answer": null,
    "correct_answer": number;
    "answered_at": string;
    "corrected_at": null | string;
    "teacher_comment": string;
    "answered": boolean;
    "answer": number;
    "learning_path_item_id": number;
    "choices": IChoices[];
}
export interface IAvaTrilhasResponse {
    "expired": boolean;
    "can_answer": boolean;
    "can_see_answer": boolean;
    "learning_path": ILearningPath;
    "questions": IQuestions[];
}