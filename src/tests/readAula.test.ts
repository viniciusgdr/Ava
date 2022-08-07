import { Ava } from "..";

test('readAula', async () => {
    const ava = new Ava('user', 'password', [])
    const result = await ava.readAula({
        headless: false,
        useToken: 'token',
    })
    expect(result).toBeInstanceOf(Array)
})