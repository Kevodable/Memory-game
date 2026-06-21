const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤'];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const pairsEl = document.getElementById('pairs');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const difficultySelect = document.getElementById('difficulty');
const winOverlay = document.getElementById('win-overlay');
const finalMovesEl = document.getElementById('final-moves');
const finalTimeEl = document.getElementById('final-time');

let flippedCards = [];
let matchedCount = 0;
let totalPairs = 8;
let moves = 0;
let timerInterval = null;
let secondsElapsed = 0;
let lockBoard = false;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  timerEl.textContent = formatTime(0);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function createCard(value, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.value = value;
  card.dataset.index = index;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">?</div>
      <div class="card-face card-back">${value}</div>
    </div>
  `;

  card.addEventListener('click', () => onCardClick(card));
  return card;
}

function onCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length === 2) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.dataset.value === second.dataset.value;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    flippedCards = [];
    matchedCount++;
    pairsEl.textContent = `${matchedCount}/${totalPairs}`;

    if (matchedCount === totalPairs) {
      stopTimer();
      setTimeout(showWin, 500);
    }
  } else {
    lockBoard = true;
    first.classList.add('mismatch');
    second.classList.add('mismatch');
    setTimeout(() => {
      first.classList.remove('flipped', 'mismatch');
      second.classList.remove('flipped', 'mismatch');
      flippedCards = [];
      lockBoard = false;
    }, 800);
  }
}

function showWin() {
  finalMovesEl.textContent = moves;
  finalTimeEl.textContent = formatTime(secondsElapsed);
  winOverlay.classList.remove('hidden');
}

function hideWin() {
  winOverlay.classList.add('hidden');
}

function buildBoard() {
  hideWin();
  stopTimer();

  totalPairs = parseInt(difficultySelect.value === '18' ? 18 : 8, 10);
  moves = 0;
  matchedCount = 0;
  flippedCards = [];
  lockBoard = false;

  movesEl.textContent = '0';
  pairsEl.textContent = `0/${totalPairs}`;
  timerEl.textContent = '00:00';

  board.classList.toggle('large', totalPairs > 8);

  const chosenEmojis = shuffle(EMOJIS).slice(0, totalPairs);
  const cardValues = shuffle([...chosenEmojis, ...chosenEmojis]);

  board.innerHTML = '';
  cardValues.forEach((value, index) => {
    board.appendChild(createCard(value, index));
  });

  startTimer();
}

restartBtn.addEventListener('click', buildBoard);
playAgainBtn.addEventListener('click', buildBoard);
difficultySelect.addEventListener('change', buildBoard);

buildBoard();
