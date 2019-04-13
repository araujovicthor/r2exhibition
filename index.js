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

const getTasks = () => new Promise(function(resolve, reject) {
    let filter = "#checkOut = :checkOut";
    let values = {':checkOut': Boolean(true)};
    let names = {"#checkOut": "checkOut"};
    
    let params = {
        TableName: process.env.taskTable,
        FilterExpression: filter,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    };

    connectionUS.scan(params, (err, data) => {
        if(err) {
            console.log('ERROR: ' + err)
            reject(err)
        } else {
            console.log(data.Items);
            resolve(data);
        }
    })
})

getRE();
// getTasks();

// console.log(getRE());
// console.log(getTasks());

// module.exports = {
//     renewPrice: async function(){
//         const data = await getData();

//         data.Items.forEach((item) => {
//             assurance = item.financial.rentValue * 0.08;
//             rentalPrice = item.financial.rentValue + assurance;

//             let params = {
//                 TableName: process.env.listingTable,
//                 Key:{
//                     "listeningId": item.listeningId                
//                 },
//                 UpdateExpression: "set financial.assurance = :assurance, RentalPrice = :rentalPrice",
//                 ExpressionAttributeValues:{
//                     ":assurance": assurance,
//                     ":rentalPrice": rentalPrice
//                 }
//             };
    
//             return new Promise((resolve, reject) => {
//                 connection.update(params, function(err, data) {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve (200);
//                     }
//                 });
//             });

//         })
//     }
// }