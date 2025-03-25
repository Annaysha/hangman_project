// Game state object
const gameState = {
    currentWord: '',
    hint: '',
    guessedLetters: new Set(),
    wrongGuesses: 0,
    maxGuesses: 7,
    isGameOver: false
};

// Word collection manager
const wordManager = {
    words: [],
    async loadWords() {
        try {
            const response = await fetch('js/words.json');
            this.words = await response.json();
        } catch (error) {
            console.error('Error loading words:', error);
        }
    },
    getRandomWord() {
        const index = Math.floor(Math.random() * this.words.length);
        return this.words[index];
    }
};

// Initialize game
async function initGame() {
    await wordManager.loadWords();
    resetGame();
    setupAlphabetButtons();
    // Add event listener for "Play Again" button
    document.getElementById('modal-play-again').addEventListener('click', () => {
        resetGame();
        closeModal();
    });
}

// Reset game state
function resetGame() {
    const wordData = wordManager.getRandomWord();
    gameState.currentWord = wordData.word.toUpperCase();
    gameState.hint = wordData.hint;
    gameState.guessedLetters.clear();
    gameState.wrongGuesses = 0;
    gameState.isGameOver = false;

    // Set initial hangman image
    document.getElementById('kenny-image').src = './images/initial.png';
    updateDisplay();
    updateGuessCounter();
    document.getElementById('game-result').classList.add('hidden');
    // Reset all alphabet buttons to their default state
    const alphabetButtons = document.querySelectorAll('#alphabet button');
    alphabetButtons.forEach(btn => {
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.disabled = false;
    });
}

// Update game display
function updateDisplay() {
    const displayWord = gameState.currentWord
        .split('')
        .map(letter => gameState.guessedLetters.has(letter) ? letter : '_')
        .join(' ');
    document.getElementById('word-display').textContent = displayWord;
    document.getElementById('hint-text').textContent = gameState.hint;
}

// Update incorrect guesses counter
function updateGuessCounter() {
    document.getElementById('guess-count').textContent = `${gameState.wrongGuesses}/${gameState.maxGuesses}`;
}

// Handle letter guess
function guessLetter(letter) {
    if (gameState.isGameOver || gameState.guessedLetters.has(letter)) return;

    gameState.guessedLetters.add(letter);
    const button = document.querySelector(`button[data-letter="${letter}"]`);
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";

    if (!gameState.currentWord.includes(letter)) {
        gameState.wrongGuesses++;
        const kennyImage = document.getElementById('kenny-image');
        kennyImage.src = `./images/angry${gameState.wrongGuesses}.png`;
        // Add scale-up animation
        kennyImage.style.transition = 'transform 0.3s ease';
        kennyImage.style.transform = 'scale(1.1)';
        // Reset the scale after animation completes
        setTimeout(() => {
            kennyImage.style.transform = 'scale(1)';
        }, 300);
        updateGuessCounter();
    }

    updateDisplay();
    checkGameStatus();
}

// Check if game is won or lost
function checkGameStatus() {
    const wordGuessed = gameState.currentWord
        .split('')
        .every(letter => gameState.guessedLetters.has(letter));

    if (wordGuessed || gameState.wrongGuesses >= gameState.maxGuesses) {
        gameState.isGameOver = true;
        showResult(wordGuessed);
    }
}

// Show game result with fade-in animation
function showResult(won) {
    const resultDiv = document.getElementById('game-result');
    const message = document.getElementById('result-message');

    message.textContent = won ? 'Congratulations! You Won!' : 'Game Over! You Lost!';
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('fade-in');

    // show result modal after 0.5 seconds
    setTimeout(() => {
        showModal(won);
    }, 500);
}

function showModal(won) {

    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const resultImage = document.getElementById('result-image');

    modalTitle.textContent = won ? 'Victory!' : 'Game Over';
    modalMessage.textContent = won
        ? `Congratulations! You correctly guessed the word: ${gameState.currentWord}`
        : `Sorry! You've run out of guesses. The word was: ${gameState.currentWord}`;

    resultImage.src = won ? './images/happy.png' : './images/sad.png';

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('result-modal').style.display = 'none';
}

function setupAlphabetButtons() {
    const alphabetDiv = document.getElementById('alphabet');
    alphabetDiv.innerHTML = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.dataset.letter = letter;
        button.addEventListener('click', () => guessLetter(letter));
        alphabetDiv.appendChild(button);
    });
}

// Start the game
initGame();