//From siddhu33
const fs = require('fs');
const readline = require('readline');


const CORPUS_PATH = 'corpus.txt';
const stream = fs.createReadStream(CORPUS_PATH);
const myInterface = readline.createInterface({
  input: stream,
});

const loadCorpus = async (wordsByLength) => {
    console.log('starting...');
    for await (const line of myInterface) {
        const lengthStr = line.length.toString();
        if (Object.keys(wordsByLength).includes(lengthStr)) {
            wordsByLength[lengthStr].push(line);
        } else {
        wordsByLength[lengthStr] = [line];
        }
    }
    console.log('corpus word statistics:');
    console.table(Object.entries(wordsByLength).map((e) => ({ length: e[0], count: e[1].length })));
    return wordsByLength;
};
module.exports = {
    loadCorpus
  };