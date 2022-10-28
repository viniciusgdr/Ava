import jwt from 'jsonwebtoken';

export class Token {
    private payload: any
    constructor (token: string) {
        this.payload = jwt.decode(token, {
            json: true
        })
    }
    get personId(): number {
        return this.payload.personId
    }
    get roles(): string[] {
        return this.payload.roles
    }
    get roleIds(): {
        person: string;
        student: string;
    } {
        return this.payload.roleIds
    }
    get schoolId(): number {
        return this.payload.schoolId
    }
    get allowedProducts(): string {
        return this.payload.allowedProducts
    }
    get sso(): boolean {
        return this.payload.sso
    }
    get iat(): number {
        return this.payload.iat
    }
    get exp(): number {
        return this.payload.exp
    }
}