
# Sae Digital - Ambiente Virtual de Aprendizagem

Conseguir respostas e driblar tempo assistido das aulas de uma forma simples!



## Instalação

Para instalar o projeto rode

```bash
npm i github:viniciusgdr/Ava
```

Importe no seu código utilizando:
```ts
import { Ava } from '@viniciusgdr/Ava'
```

## Testes
TODO
## Uso/Exemplos

####  Ver todas as aulas
```ts
import { Ava } from '@viniciusgdr/Ava'

let ava = new Ava(YOUR_LOGIN, YOUR_PASSWORD, [
    ...ArrayOfVideos
])
await ava.readAula()
```
#### Usar outro login como cobaia e re-passar para o seu em imediato

```ts
import { Ava } from '@viniciusgdr/Ava'

let ava = new Ava(YOUR_LOGIN, YOUR_PASSWORD, [
    ...ArrayOfVideos
])
await ava.makeActivites(COBAIA_LOGIN, COBAIA_PASSWORD)
```
## Licença

[MIT](https://choosealicense.com/licenses/mit/)


## Autores

- [@viniciusgdr](https://www.github.com/viniciusgdr)

