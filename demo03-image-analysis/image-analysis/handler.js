'use strict';
const { promises: { readFile } } = require('fs');

class Handler {
  constructor({ rekognitionSvc, translatorSvc }) {
    this.rekognition = rekognitionSvc;  
    this.translator = translatorSvc;
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const { TranslatedText } = await this.translator.translateText(params).promise();

    const namesInList = TranslatedText.split(' e ');

    return { namesInList };
  }

  async detectImageLabels(buffer) {
    const result = await this.rekognition.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 80);

    const names = workingItems.map(({ Name }) => Name).join(' and ');
    
    return { names, workingItems };
  }

  formatTextResults(texts, workingItems) {
    const finalText = [];
    for(const indexText in texts) {
      const nameInPortuguese = texts[indexText];
      const item = workingItems[indexText]

      finalText.push(`${item.Name} é ${nameInPortuguese} em português e têm a ${item.Confidence.toFixed(2)}% de chance de ser o que têm na imagem.`)
    }

    return finalText;
  }

  async main(event) {
    try {
      const imgBuffer = await readFile('./images/cat.jpg');
      console.log('Detecting Labels');
      const { names, workingItems } = await this.detectImageLabels(imgBuffer)

      console.log('Translating to portuguese')
      const { namesInList } = await this.translateText(names);

      console.log("handling final object...");
      const results = this.formatTextResults(namesInList, workingItems);

      return {
        statusCode: 200,
        body: JSON.stringify({ results }, null, 2)
      }
    }catch(error) {
      console.log('Error***', error.stack)
      return {
        statusCode: 500,
        body: 'Internal error server'
      }
    }
  }
}

//factory 
const aws = require('aws-sdk');
const rekognitionSvc = new aws.Rekognition();
const translatorSvc = new aws.Translate();

const handler = new Handler({
  rekognitionSvc, 
  translatorSvc
});

module.exports.main = handler.main.bind(handler);