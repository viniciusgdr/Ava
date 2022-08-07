import { IChoices } from ".";

export interface IQuestions {
    card_item_id: number,
    jarvisItemId: number,
    stem: string,
    data_cadastro: string,
    tag_name: string,
    teacher_comment: string,
    student_answer: string | null,
    correct_answer: string | null,
    corrected_at: string | null,
    answered_at: string | null,
    answered: boolean,
    answer: number;
    choices: IChoices[]
    learning_path_item_id: number
    random_options_sequence?: number[]
}