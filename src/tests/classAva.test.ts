import { Ava } from "..";

test('ava constructor', () => {
    expect(() => {
        new Ava('user', 'password', ['url'])
    }).not.toThrow()
})
