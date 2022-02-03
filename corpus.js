//From siddhu33
const fs = require('fs');
const readline = require('readline');


const CORPUS_PATH_GUESSES = 'wordle-allowed-guesses.txt';
const stream_guesses = fs.createReadStream(CORPUS_PATH_GUESSES);
const myInterface_guesses = readline.createInterface({
  input: stream_guesses,
});


const loadCorpusGuesses = async (wordsByLength) => {
    console.log('starting...');
    for await (const line of myInterface_guesses) {
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
    loadCorpusGuesses
  };