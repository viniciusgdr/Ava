
# AVA - Sae Digital 
A Plugin for getting automatic responses via Puppeteer

## Instalação

Install with npm

```bash
  npm install @viniciusgdr/Ava
  cd my-project
```
    
## Uso/Exemplos
Importing
```ts
import { Ava } from '@viniciusgdr/Ava'
```

Using Async/await
```ts
let res = await new Ava('URL_TRILHAS', 'USER', 'KEY').avaTrilhas()
console.log(res)
```
or
```ts
new Ava('URL_TRILHAS', 'USER', 'KEY').avaTrilhas().then((res) => {
    console.log(res)
})
```
## Config
```ts
"headless"?: boolean;
"args"?: string[];
"executablePath"?: string;
```
Example:
```ts
let res = await new Ava('URL_TRILHAS', 'USER', 'KEY').avaTrilhas({
    headless: true
})
console.log(res)
```