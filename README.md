# Sae Digital - Ambiente Virtual de Aprendizagem

Conseguir respostas e driblar tempo assistido das aulas de uma forma simples!

## Instalação

Para instalar o projeto rode

```bash
npm i github:viniciusgdr/Ava
```

Importe no seu código utilizando:

```ts
import { Ava } from "@viniciusgdr/Ava";
```

## Testes

TODO

## Uso/Exemplos

### Realizar Video Aulas
```ts
import { Ava } from "@viniciusgdr/Ava";

// Coleta todas as atividades pendentes e realiza as atividades
const ava = new Ava('user', 'pass');

// caso queira realizar apenas as que você queira
const ava = new Ava('user', 'pass', ['aula1', 'aula2']);

await ava.makeAulasByMeLogin('video')
```

### Realizar Atividades Aprova+
```ts
import { Ava } from "@viniciusgdr/Ava";

// Coleta todas as atividades pendentes e realiza as atividades
const ava = new Ava('user', 'pass');
await ava.makeAulasByMeLogin('aprova-mais')

// caso queira realizar apenas as que você queira
const ava = new Ava('user', 'pass', ['aula1', 'aula2']);
await ava.makeAulasByMeLogin('aprova-mais')
```

### Realizar Trilhas e Reforço
```ts
import { Ava } from "@viniciusgdr/Ava";

// Coleta todas as atividades pendentes e realiza as atividades
const ava = new Ava('user', 'pass');

// caso queira realizar apenas as que você queira
const ava = new Ava('user', 'pass', ['aula1', 'aula2']);

await ava.makeAulasByAnotherUser(
        'usercobaia',
        'passwordcobaia'        
)
```

## Funções
Pegar todas as ativiades pendentes do site
```ts
import { getAllMateries } from "@viniciusgdr/Ava";

let result = await getAllMateries(TOKEN, PERSON_ID);
// result é um array de urls com as atividades pendentes
console.log(result);
```

## Opções

Para todos os méteodos, você pode passar um objeto de opções como parâmetro.

### Parâmetros de makeAulasByAnotherUser

```ts
await ava.makeAulasByAnotherUser(COBAIA_LOGIN, COBAIA_PASSWORD, {
        puppeteer?: {
            chromePath: string,
            browser: puppeteer.Browser,
            headless: boolean
        },
        loginUser?: {
            tokenUser: string
        }
        loginAnotherUser?: {
            tokenAnotherUser: string
        }
})
```

### Parâmetros de makeAulasByMeLogin

```ts
await ava.makeAulasByMeLogin('aprova-mais' | 'video', {
        puppeteer?: {
            chromePath: string,
            browser: puppeteer.Browser,
            headless: boolean
        },
        loginUser?: {
            tokenUser: string
        }
});
```
## Licença

[MIT](https://choosealicense.com/licenses/mit/)


## Autores

- [@viniciusgdr](https://www.github.com/viniciusgdr)

```
