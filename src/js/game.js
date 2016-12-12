'use strict';

const Game = (function(window) {
  const api_url = 'https://api.wordnik.com/v4/words.json/randomWord?';
  const api_opt ='hasDictionaryDef=true&minCorpusCount=10&maxCorpusCount=-1&minDictionaryCount=10&maxDictionaryCount=-1&minLength=4&maxLength=16&'
  const api_key = 'api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  const api = api_url + api_opt + api_key;
  const dom = {};
  let target = '';
  const hints = {};
  let errors = 0;
  let maxErrors = 10;

  function init() {
    cacheDOM();
    bindEvents();
    getWord();
  }

  function cacheDOM() {
    dom.start = document.getElementById('start');
    dom.game = document.getElementById('game');
    dom.word = document.getElementById('word');
    dom.keyboard = document.getElementById('keyboard');
    dom.man = document.getElementById('man');
    dom.gameover = document.getElementById('gameover');
    dom.target = document.getElementById('target');
  }

  function bindEvents() {
    dom.start.addEventListener('click', start);
    dom.keyboard.addEventListener('click', handleTyping)
  }

  function start() {
    dom.game.classList.add('playing');
  }

  function getWord() {
    fetch(api)
    .then(res => res.json())
    .then(res => res.word)
    .then(word => word.toLowerCase())
    .then(word => {
      target = word;
      dom.target.textContent = target;
      return word;
    })
    .then(word => {
      console.log(word);
      buildWord(word);
      return word;
    })
    .then(_ => {
      return fetch('http://api.wordnik.com:80/v4/word.json/' + target +'/relatedWords?useCanonical=true&relationshipTypes=rhyme&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5')
    })
    .then(res => res.json())
    .then(res => {
      if (res.length !== 0) return;

    })
    .then(_ => fetch('http://api.wordnik.com:80/v4/word.json/' + target + '/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'))
    .then(res => res.json())
    .then(res => console.log('synonyms are ', res))
    .catch(err => console.error(err));
  }

  function buildLetter(letter) {
    let div = document.createElement('div');
    div.classList.add('letter');
    div.textContent = letter;

    let placeholder = document.createElement('div');
    placeholder.classList.add('placeholder');
    placeholder.appendChild(div);

    dom.word.appendChild(placeholder);
  }

  function buildWord(word) {
    let letters = word.split('');
    for (let i = 0; i < letters.length; i++) {
      buildLetter(letters[i]);
    }
  }

  function handleTyping(event) {

    if (event.target !== dom.keyboard) {
      event.target.classList.add('used');
      let indexes = indexesOfLetter(event.target.dataset.letter);

      if (indexes.length === 0) {
        errors += 1;

        if (errors === maxErrors) {
          dom.man.classList.add('hanging');
          dom.gameover.classList.add('active');
        }

        if (errors <= maxErrors) {
          document.getElementById('svg_' + errors).classList.add('draw');
        }
      }

      for (let i = 0; i < indexes.length; i++) {
        revealNthLetter(indexes[i]);
      }
    }
  }

  function indexesOfLetter(letter) {
    let indexes = [];
    for (let i = 0; i < target.length; i++) {
      if (target[i] === letter) {
        indexes.push(i);
      }
    }
    return indexes;
  }

  function revealAll() {
    // setTimeout(Game.reveal.bind(null, 1), 500);
    // setTimeout(Game.reveal.bind(null, 2), 1500);
    // setTimeout(Game.reveal.bind(null, 3), 2000);
    // setTimeout(Game.reveal.bind(null, 4), 2500);
    // setTimeout(Game.reveal.bind(null, 5), 3000);
    // setTimeout(Game.reveal.bind(null, 6), 3500);
    // setTimeout(Game.reveal.bind(null, 7), 4000);
    // setTimeout(Game.reveal.bind(null, 8), 4500);
    // setTimeout(Game.reveal.bind(null, 9), 5000);
    // setTimeout(Game.reveal.bind(null, 10), 5500);


  }

  function revealNthLetter(n) {
    console.log('reveal ', n)
    dom.word.getElementsByClassName('letter')[n].classList.add('revealed');
  }

  function getHints() {
    // same-context
    // http://api.wordnik.com:80/v4/word.json/production/relatedWords?useCanonical=true&relationshipTypes=same-context&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5

    // synonyms
    // http://api.wordnik.com:80/v4/word.json/production/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5

    // rhyme
    // http://api.wordnik.com:80/v4/word.json/production/relatedWords?useCanonical=true&relationshipTypes=rhyme&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5

    // hypernym
    // http://api.wordnik.com:80/v4/word.json/production/relatedWords?useCanonical=true&relationshipTypes=hypernym&limitPerRelationshipType=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5

  }


  function updateTimer() {
    time += 1;
    dom.timer.textContent = formatTime(time);
  }

  function formatTime(secs) {
    const mins = ('0' + Math.floor(secs / 60)).slice(-2);
    secs = ('0' + (secs % 60)).slice(-2);

    return `${mins}:${secs}`;
  }

  function wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

  return {
    init: init,
    reveal: revealNthLetter
  }
})(window);

Game.init();
