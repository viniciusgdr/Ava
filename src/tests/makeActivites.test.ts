import { Ava } from "..";

test('makeActivites', async () => {
    const ava = new Ava('user', 'password', [])
    const result = await ava.makeAulasByAnotherUser('user', 'password', {
        loginUser: {
            tokenUser: 'token',
            personId: 'personId'
        },
        loginAnotherUser: {
            tokenAnotherUser: 'tokenAnotherUser',
            personIdAnotherUser: 'personIdAnotherUser'
        }
    })
    expect(result).toBeInstanceOf(Array)
})