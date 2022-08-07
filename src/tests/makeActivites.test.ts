import { Ava } from "..";

test('makeActivites', async () => {
    const ava = new Ava('user', 'password', [])
    const result = await ava.makeActivites('user', 'password', {
        headless: true,
        useToken: 'token',
        useTokenCobaia: 'token'
    })
    expect(result).toBeInstanceOf(Array)
})