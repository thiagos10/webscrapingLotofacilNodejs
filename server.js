
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const CronJob = require('cron').CronJob
require('dotenv').config()
const http = require('http').createServer(servidor)
const knex = require('./database_knex')
const puppeteerConfig = require('./puppeteer_config')
const port = (process.env.PORT || 3000)
const datetime = new Date()

function servidor(req, res) {
    res.writeHead(200)
    res.end(process.env.APP_NAME);
}

http.listen(port, function () {
    console.log('Servidor On-line - ' + port)
})

function convertDate(data) {
    var dia = data.split("/")[0]
    var mes = data.split("/")[1]
    var ano = data.split("/")[2]
    return ano + '-' + ("0" + mes).slice(-2) + '-' + ("0" + dia).slice(-2)
}

//const job = new CronJob('*/1 * * * *', () => { // a cada 1 minuto
const job = new CronJob('0 * * * *', () => { // a cada 1 hora    

    (async () => {
        try {
            //const browser = await puppeteer.launch({ puppeteerConfig })
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreDefaultArgs: ['--disable-extensions'] })
            const page = await browser.newPage()
            await page.goto('http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil')
            let html = await page.content()
            const $ = cheerio.load(html)
            let resultado = $('.title-bar > h2:nth-child(2) > span:nth-child(1)').text()
            let num1 = $('li.ng-binding:nth-child(1)').text().trim()
            let num2 = $('li.ng-binding:nth-child(2)').text().trim()
            let num3 = $('li.ng-binding:nth-child(3)').text().trim()
            let num4 = $('li.ng-binding:nth-child(4)').text().trim()
            let num5 = $('li.ng-binding:nth-child(5)').text().trim()
            let num6 = $('li.ng-binding:nth-child(6)').text().trim()
            let num7 = $('li.ng-binding:nth-child(7)').text().trim()
            let num8 = $('li.ng-binding:nth-child(8)').text().trim()
            let num9 = $('li.ng-binding:nth-child(9)').text().trim()
            let num10 = $('li.ng-binding:nth-child(10)').text().trim()
            let num11 = $('li.ng-binding:nth-child(11)').text().trim()
            let num12 = $('li.ng-binding:nth-child(12)').text().trim()
            let num13 = $('li.ng-binding:nth-child(13)').text().trim()
            let num14 = $('li.ng-binding:nth-child(14)').text().trim()
            let num15 = $('li.ng-binding:nth-child(15)').text().trim()
            let ganhadores = $('p.ng-scope:nth-child(2) > span:nth-child(3)').text().trim().split(" ", 3)[0]
            let estimado = $('p.value').text().trim()
            let proximocons = $('.next-prize > p:nth-child(1)').text().trim() //.replace(/(\r\n|\n|\r)/gm, "").substring(76, 87)
            let regExp = /\(([^()]*)\)/g
            let data = regExp.exec(resultado)

            await knex('TAB_LOTOFACIL').where({
                COD_SORT: resultado.substring(9, 13)
            }).then((result) => {
                if (result != undefined && result != "") {
                    console.log('Ja existe')
                } else {
                    console.log('Não existe')
                    if (resultado.substring(9, 13) != 0) {
                        knex('TAB_LOTOFACIL').insert({
                            COD_SORT: resultado.substring(9, 13),
                            DTA_SORT: convertDate(data[1]),
                            COD_BOL1: num1,
                            COD_BOL2: num2,
                            COD_BOL3: num3,
                            COD_BOL4: num4,
                            COD_BOL5: num5,
                            COD_BOL6: num6,
                            COD_BOL7: num7,
                            COD_BOL8: num8,
                            COD_BOL9: num9,
                            COD_BOL10: num10,
                            COD_BOL11: num11,
                            COD_BOL12: num12,
                            COD_BOL13: num13,
                            COD_BOL14: num14,
                            COD_BOL15: num15,
                            NUM_VENC: ganhadores === 'Não' ? 0 : ganhadores,
                            DTA_NEXT: convertDate(proximocons.trim()),
                            VLR_ESTI: estimado,
                            DTA_INC: datetime,
                            NOM_USE_INC: 'WEB',
                            STA_ATV: 1
                        })
                            .then((result) => {
                                console.log('insert finalizado ' + resultado.substring(9, 13))
                            })
                    }
                }
            })
            
            now = new Date
            console.log(`
                Concurso: ${resultado.substring(9, 13)}
                Data: ${convertDate(data[1])}
                ganhadores: ${ganhadores === 'Não' ? 0 : ganhadores}
                num1: ${num1}
                num2: ${num2}
                num3: ${num3}
                num4: ${num4}
                num5: ${num5}
                num6: ${num6}
                num7: ${num7}
                num8: ${num8}
                num9: ${num9}
                num10: ${num10}
                num11: ${num11}
                num12: ${num12}
                num13: ${num13}
                num14: ${num14}
                num15: ${num15}
                estimado: ${estimado}
                proximo: ${convertDate(proximocons.trim())}
                hora: ${now.getHours()}
                minutos: ${now.getMinutes()}
            `)

            await browser.close()
        } catch (err) {
            console.log('erro de conexao', err)
        }
    })()

}, null, true, 'America/Sao_Paulo')
