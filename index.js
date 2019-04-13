// RuaDois - Comercial
// Microserviço de cálculo de nível de exibição de imóveis em portais externos
// Autor: Victhor Araújo @araujovicthor
// Licença: Uso exclusivo RuaDois. Não pode ser copiado e/ou distribuído sem autorização do autor

// Seta variáveis de ambiente para ambiente de desenvolvimento
require('dotenv').config();


// Pacotes utilizados
const connectionSP = require('./db/connectionSP');
const connectionUS = require('./db/connectionUS');


const getRE = () => new Promise(function(resolve, reject) {
    let filter = "#pub = :status";
    let values = {':status': Boolean(true)};
    let names = {"#pub": "publish"};
    const listening = [];
    
    let params = {
        TableName: process.env.listingTable,
        FilterExpression: filter,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    };

    connectionSP.scan(params, (err, data) => {
        if(err) {
            console.log('ERROR: ' + err)
            reject(err)
        } else {
            for (var i = 0; i < data.Items.length; i++){
                let lData = {
                    "listeningId": data.Items[i].listeningId,
                    "companyId": data.Items[i].companyId,
                    "ListingIdImob": data.Items[i].ListingIdImob,
                    "exhibition": data.Items[i].exhibition
                }
                listening.push(lData);
            }
            resolve(listening);
        }
    })
})

function getTasks(companyName, listeningIdCompany){
    let filter = "#companyName = :companyName AND #listeningIdCompany = :listeningIdCompany AND #checkOut = :checkOut";
    let values = {":companyName": companyName, ":listeningIdCompany": listeningIdCompany, ":checkOut": Boolean(true)};
    let names = {"#companyName":"company", "#listeningIdCompany":"companyCode", "#checkOut": "checkOut"};
    
    let params = {
        TableName: process.env.taskTable,
        FilterExpression: filter,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    };

    return new Promise((resolve, reject) => {
        connectionUS.scan(params, (err, data) => {
            if(err) {
                console.log('ERROR: ' + err)
                reject(err)
            } else {
                resolve(Object.keys(data.Items).length);
            }
        })
    });
}

function getBids(listeningId){
    let filter = "#listeningId = :listeningId AND #statusBid <> :statusBid";
    let values = {":listeningId": listeningId, ":statusBid": "Declined"};
    let names = {"#listeningId":"listeningId", "#statusBid": "statusBid"};
    
    let params = {
        TableName: process.env.bidTable,
        FilterExpression: filter,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    };

    return new Promise((resolve, reject) => {
        connectionSP.scan(params, (err, data) => {
            if(err) {
                console.log('ERROR: ' + err)
                reject(err)
            } else {
                var statusBidAd = false;
                for (var i = 0; i < data.Items.length; i++){
                    if (data.Items[i].statusBid === "Evaluate Credit" || data.Items[i].statusBid === "Sign"){
                        statusBidAd = true;
                    }
                }
                let bid = {qty: Object.keys(data.Items).length, statusBid: statusBidAd};
                resolve(bid);
            }
        })
    });
}

function getCompany(companyId){
    const params = {
        TableName: process.env.companyTable,
        Key:{
            "companyId": companyId
        }
    };

    return new Promise((resolve, reject) => {
        connectionSP.get(params, (err, data) => {
            if(err) {
                console.log('ERROR: ' + err)
                reject(err)
            } else {
                resolve(data.Item.companyName);
            }
        })
    });
}

function slack (listeningId){
    var request = require("request");

    var options = { 
        method: 'POST',
        url:'https://hooks.slack.com/services/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',
        headers: { 'content-type': 'application/json' },
        body:{
            text: 'Um imóvel atingiu 10 visitas sem propostas! <https://portal.ruadois.com.br/imovel/'+listeningId+'|Clique aqui> para ver o imóvel!' 
        },
        json: true
    };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
    });
}

function updateListening (listeningId, exhibition){
    const params = {
        TableName: process.env.listingTable,
        Key:{
            "listeningId": listeningId
        },
        UpdateExpression: "set exhibition = :exhibition",
        ExpressionAttributeValues:{
            ":exhibition": exhibition
        }
    };

    return new Promise((resolve, reject) => {
        connectionSP.get(params, (err, data) => {
            if(err) {
                console.log('ERROR: ' + err)
                reject(err)
            } else {
                resolve(data.Item.companyName);
            }
        })
    });
}

async function exhibition(){
    const listening = await getRE();
    for (var i = 0; i < listening.length; i++){
        const companyName = await getCompany(listening[i].companyId);
        const tasks = await getTasks(companyName, listening[i].ListingIdImob);
        const bids = await getBids(listening[i].listeningId);
        if (tasks>=10 && bids.qty === 0){
            slack(listening[i].listeningId)
        } else if (bids.statusBid === true){
            let exhibition = 0;
            updateListening(listening[i].listeningId, exhibition);
        } else if (tasks<=10 && listening[i].exhibition !== 10){
            let exhibition = 10;
            updateListening(listening[i].listeningId, exhibition);
        } else {

        }
    }
}

exhibition();