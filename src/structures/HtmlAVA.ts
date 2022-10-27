import { getstr } from "../utils/getHtml";


export class htmlAVA {
    constructor(
        private readonly html: string
    ) { }
    get learningPathId() {
        return getstr(this.html, "const learningPathId = '", "'", 0)
    }
    get learningPathItemId() {
        return getstr(this.html, "const learningPathItemId = '", "'", 0);
    }
    get scheduleId() {
        return getstr(this.html, "const scheduleId = '", "'", 0);
    }
    get urlVideo() {
        return getstr(this.html, 'id="ava-video-container" src="', '"', 0);
    }
}