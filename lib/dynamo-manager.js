'use strict'

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const BbPromise = require('bluebird');
const parse = BbPromise.promisify(require('csv-parse'));
const attr = require('dynamodb-data-types').AttributeValue;

const documentClient = new AWS.DynamoDB.DocumentClient();

const loadFile = (filename) => {
    return fs.readFileSync(
        path.resolve(process.cwd(), filename)
    );
}

const jsonModels = (filename) => {
    const jsonFile = JSON.parse(loadFile(filename));
    return jsonFile;
}

const csvModels = (filename) => {

    console.log('Reading in seed file from ', filename)
    const csvFile = loadFile(filename);

    return parse(csvFile, {
            skip_empty_lines: true
        })
        .then((dynamoTupils) => {
            const columnKeys = dynamoTupils.shift().map(item => {
                const type = item.match(/(?=\s*)[A-Z]+/);
                const field = item.match(/^[A-Za-z_]*/);
                return {
                    field: field[0],
                    type: type[0]
                }
            });

            // map each row
            return dynamoTupils.map((cert) => {
                //map each column
                return cert.reduce((accum, column, indx) => {
                    const val = convertDynamoType(column, columnKeys[indx].type);
                    accum[columnKeys[indx].field] = val;
                    return accum;
                }, {});
            });
        });
};

const convertDynamoType = (obj, type) => {

    switch(type) {
        case 'S':
            return String(obj);
        case 'N':
            return parseFloat(obj);
        case 'M':
            return attr.unwrap(JSON.parse(obj));
    }

}

const dynamoBatchFill = (tableName, models) => {

    var params = {
        RequestItems: {}
    };

    const putModels = models.map((item) => {
        return {
            PutRequest: {
                Item: item
            }
        }
    });

    params.RequestItems[tableName] = putModels;
    return documentClient.batchWrite(params).promise();
};

const seed = BbPromise.coroutine(function*(tablename, options) {

    const filetype = options.json ? 'json' : options.csv ? 'csv' : null;

    if(!filetype) {
        console.log('you must specify a json or csv file');
        return;
    }

    const filename = options[filetype];

    let models = [];

    if(filetype === 'json'){
        models = jsonModels(filename);
    } else if (filetype === 'csv') {
        models = yield csvModels(filename);
    }

    if(options.parent.profile) {
        const credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
        AWS.config.credentials = credentials;
    }

    return dynamoBatchFill(tablename, models).then((result) => {
        console.log(result);
    }).catch(err => console.error(err));

});

// const backup = BbPromise.coroutine(function*(tablename, options) {
//     const filetype = options.json ? 'json' : options.csv ? 'csv' : null;

//     if(!filetype) {
//         console.log('you must specify a json or csv file');
//         return;
//     }

//     const filename = options[filetype];

//     if(options.parent.profile) {
//         const credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
//         AWS.config.credentials = credentials;
//     }

//     return dynamoGetTable(tablename).then((result) => {
//         console.log(result);
//     }).catch(err => console.error(err));
// });

module.exports = {
    seed,
    // backup
}
