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

#### Ver todas as aulas

```ts
import { Ava } from "@viniciusgdr/Ava";

let ava = new Ava(YOUR_LOGIN, YOUR_PASSWORD, [...ArrayOfVideos]);
await ava.readAula();
```

#### Usar outro login como cobaia e re-passar para o seu em imediato

```ts
import { Ava } from "@viniciusgdr/Ava";

let ava = new Ava(YOUR_LOGIN, YOUR_PASSWORD, [...ArrayOfVideos]);
await ava.makeActivites(COBAIA_LOGIN, COBAIA_PASSWORD);
```

#### Realizar TODAS as Tarefas pendentes do site. (Trilhas/Reforço e VideoAulas)

```ts
import { Ava } from "@viniciusgdr/Ava";

let ava = new Ava(YOUR_LOGIN, YOUR_PASSWORD, []);
await ava.realizeAllActivitesFromAVA(COBAIA_LOGIN, COBAIA_PASSWORD);
```
## Funções
Pegar todas as ativiades pendentes do site
```ts
import { getAllMateries } from "@viniciusgdr/Ava";

await getAllMateries(TOKEN, PERSON_ID);
```

## Opções

Para todos os méteodos, você pode passar um objeto de opções como parâmetro.

### Parâmetros de realizeAllActivitesFromAVA

```ts
await ava.realizeAllActivitesFromAVA(COBAIA_LOGIN, COBAIA_PASSWORD, {
        headless?: boolean,
        chromePath?: string,
        useToken?: string,
        useTokenCobaia?: string,
        browser?: puppeteer.Browser,
        browserCobaia?: puppeteer.Browser,
        personId?: string,
        personIdCobaia?: string
})
```

### Parâmetros de makeActivites

```ts
await ava.makeActivites(COBAIA_LOGIN, COBAIA_PASSWORD, {
        headless?: boolean,
        browser?: puppeteer.Browser,
        browserCobaia?: puppeteer.Browser,
        useToken?: string,
        useTokenCobaia?: string
});
```

### Parâmetros de readAula

```ts
await ava.readAula({
        headless?: boolean,
        chromePath?: string,
        useToken?: string,
        browser?: puppeteer.Browser
});
```
## Licença

[MIT](https://choosealicense.com/licenses/mit/)


## Autores

- [@viniciusgdr](https://www.github.com/viniciusgdr)

```
