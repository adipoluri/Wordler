const {MessageEmbed} = require('discord.js');
const VALID_LENGTHS = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const LETTERS = Array.from('abcdefghijklmnopqrstuvwxyz');
const RESPONSE_EMOJI = {
  0: ':black_large_square:',
  1: ':yellow_square:',
  2: ':green_square:',
};

const defaultState = (started = false, length = -1, word = '', guesses = -1) => ({
  started,
  length,
  word,
  guesses,
  data: "",
  letters: new Set(),
});

function wordleEmbed(data,letters)  {
    return new MessageEmbed()
    .setAuthor({
        name: 'WORDLER',
        iconURL:'https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1397203448/0c20b28720f32a98d7c64f9655341edc.png'})
    .setTitle('Type "!g" <word> to guess the word!')
    .setDescription(data)
    .addFields(
        {name: 'Letters Left', value: letters},
    )
    .setColor(0x0099ff)
    .setFooter(
        {text:'Made by Adi Poluri', 
        iconURL:'https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1397203448/0c20b28720f32a98d7c64f9655341edc.png'}
        );
};

const letterText = (failedSet) => {
    let retVal = "";
    for(let i = 0; i < 26; i++) {
        console.log(failedSet.has(LETTERS[i]));
        if(failedSet.has(LETTERS[i])){
            retVal += "~~" + LETTERS[i] + "~~";
        } else {
            retVal += LETTERS[i];
        }
    }
    return retVal;  
};

function union(setA, setB) {
    let _union = new Set(setA)
    for (let elem of setB) {
        _union.add(elem)
    }
    return _union
}

const testWord = (guess, answer) => {
    const results = [];
    const letters = new Set();
    for (let i = 0; i < guess.length; i += 1) {
        const char = guess[i];
        if (char === answer[i]) {
            results.push('2');
        } else if (answer.includes(char)) {
            results.push('1');
        } else {
            results.push('0');
            letters.add(char);
        }
    }
    return [results, letters];
};


const wordleCreate = async (msg, args, words, lobbies) => {
    if (lobbies[msg.channel.id] != null) {
        msg.channel.send("There is already an active lobby in this channel!");
        return;
    }

    

    const thread = await msg.channel.threads.create({
        name: 'Wordle Lobby',
        autoArchiveDuration: 60,
        reason: 'A thread for Wordle!',
        rateLimitPerUser: 2,

    });
    lobbies[thread.id] = defaultState(false, -1, '', 0);
    console.log(`Created thread: ${thread.name}`);
    return;
};


const startGame = async (msg, args, corpus, lobbies) => {
    if (lobbies[msg.channel.id] == null) {
        msg.channel.send("Create a lobby using !wordle first!");
        return;
    }
    if (lobbies[msg.channel.id].started) {
        return;
    }

    const stateInd = msg.channel.id;
    
    let wordLength = '5';
    if (args.length > 0) {
        wordLength = args[0];
    }
    console.log(wordLength);
    if (!VALID_LENGTHS.includes(wordLength)) {
        msg.channel.send("Please enter a valid word length");
        return;
    }

    const words = corpus[wordLength];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const game = wordleEmbed("","abcdefghijklmnopqrstuvwxyz");
    
    console.log(`random word ${randomWord} selected`);
    
    lobbies[stateInd].started = true;
    lobbies[stateInd].word = randomWord;
    lobbies[stateInd].length = parseInt(wordLength, 10);
    

    msg.channel.send('*Wordle Game Started*');
    message = msg.channel.send({embeds: [game]})
};


const guess = (msg, args, corpus, lobbies) => {
    if(msg.channel.isThread() && lobbies[msg.channel.id] != null) {
        if(!lobbies[msg.channel.id].started) {
            msg.channel.send('Start a game with !start first!');
            return;
        }
    }

    if(!msg.channel.isThread()) {
        msg.channel.send('Join an existing Lobby or start a Lobby with !wordle first!');
        return;
    }

    if(!args.length > 0) {
        return;
    }

    const wordGuess = args[0];

    if (wordGuess.length !== lobbies[msg.channel.id].length) {
        return;
    }
    
    console.log(corpus[wordGuess.length.toString()].includes(wordGuess))
    if (!corpus[wordGuess.length.toString()].includes(wordGuess)){
        return;
    }

    const [testResult, letters] = testWord(args[0], lobbies[msg.channel.id].word);
    const numSuccess = testResult.reduce((a, b) => (b === '2' ? a + 1 : a), 0);

    const success = numSuccess === lobbies[msg.channel.id].length;
    const guessCount = lobbies[msg.channel.id].guesses += 1;
    let newLine = testResult.map((r) => RESPONSE_EMOJI[r]).join('');
    newLine += wordGuess.split('').join(' ') + "\n";
    lobbies[msg.channel.id].data += newLine;
    lobbies[msg.channel.id].letters = union(lobbies[msg.channel.id].letters, letters);

    msg.channel.send('Guess #' + guessCount);
    msg.channel.send({ embeds: [wordleEmbed(lobbies[msg.channel.id].data, letterText(lobbies[msg.channel.id].letters))] });


    if (success) {
        msg.channel.send(`Congrats on winning the game! Type !start to play another round!`);
        lobbies[msg.channel.id] = defaultState(false, -1, '', 0);
        return;
    }
};





module.exports = {
    defaultState,
    commands: {
        wordle: wordleCreate,
        start: startGame,
        g: guess
    },
  };