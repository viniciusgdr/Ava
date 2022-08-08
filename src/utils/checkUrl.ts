export function checkUrl(url: string, type: 'video' | 'trilha' | 'reforco' | 'aprova-mais') {
    if (type == 'video') {
        // https://ava.sae.digital/trilha/video/9/matematica/videoaulas-livro-3/4/XXXXX/XXXX/organizacao-leitura-e-interpretacao-aula-01
        let urlSplited = url.split('/')
        if (urlSplited[3] == 'trilha' && urlSplited[4] == 'video') {
            return true
        } else return false
    } else if (type == 'trilha') {
        // https://ava.sae.digital/trilha/objetiva/9/matematica/livro-3/1/XXXXX/XXXX/organizacao-leitura-e-interpretacao
        let urlSplited = url.split('/')
        if (urlSplited[3] == 'trilha' && urlSplited[4] == 'objetiva' && urlSplited[8] == '1') {
            return true
        } else return false
    } else if (type == 'reforco') {
        // https://ava.sae.digital/trilha/objetiva/9/matematica/livro-3/11/XXXXX/XXXX/medidas-de-tendencia-central-e-de-dispersao
        let urlSplited = url.split('/')
        if (urlSplited[3] == 'trilha' && urlSplited[4] == 'objetiva' && urlSplited[8] == '11') {
            return true
        } else return false
    } else if (type == 'aprova-mais') {
        let urlSplited = url.split('/')
        if (urlSplited[3] == 'aprova-mais') {
            return true
        } else return false
    }
}