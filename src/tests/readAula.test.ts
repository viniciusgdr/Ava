import { Ava } from "..";

test('readAula', async () => {
    const ava = new Ava('user', 'password', [])
    const result = await ava.makeAulasByMeLogin('video', {
        loginUser: {
            tokenUser: 'token',
            personId: 'personId'
        }
    })
    expect(result).toBeInstanceOf(Array)
})