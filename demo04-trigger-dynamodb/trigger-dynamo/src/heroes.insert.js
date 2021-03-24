const uuid = require('uuid');
const Joi = require('@hapi/joi')
const decoratorValidator = require('./util/decoratorValidator');
const globalEnum = require('./util/globalEnum');

class Handler {
    constructor({ dynamoDbSvc }) {
        this.dynamoDbSvc = dynamoDbSvc;
        this.dynamodbTable = process.env.DYNAMODB_TABLE;
    }

    static get validator() {
        return Joi.object({
            nome: Joi.string().max(100).min(2).required(),
            poder: Joi.string().max(20).required()
        })
    }

    async insertItem(params) {
        return await this.dynamoDbSvc.put(params).promise()
    }

    prepareData(data) {
        const params = {
            TableName: this.dynamodbTable,
            Item: {
                ...data,
                id: uuid.v1(),
                createdAt: new Date().toISOString()
            }
        }

        return params;
    }

    handlerSuccess(data) {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }

        return response;
    }

    handlerError(data) {
        const response = {
            statusCode: data.statusCode || 501,
            headers: { 'Content-type': 'text/plain' },
            body: 'Couldn\'t create item!!'
        }

        return response;
    }

    async main(event) {
        try{
            // agora o decorator modifica o body e já 
            // retorna no formato JSON
            const { body } = event;
            console.log('**BODY', body);

            const dbParams = this.prepareData(body);
            await this.insertItem(dbParams);

            return this.handlerSuccess(dbParams.Item);
        
        }catch(error) {
            console.log("Deu ruim**", error.stack)
            return this.handlerError({ statusCode: 500 });
        }
    }
}


//factory
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const handler = new Handler({
    dynamoDbSvc: dynamodb
});

module.exports = decoratorValidator(
    handler.main.bind(handler),
    Handler.validator,
    globalEnum.ARG_TYPE.BODY
)