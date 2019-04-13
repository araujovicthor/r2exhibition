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
            console.log(data);
            console.log(Object.keys(data.Items).length);
            resolve(data);
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

getTasks("Test Company", "TC008").then(tasks => console.log(tasks));