let allWords = [];
let currentQuestion = null;
let score = 0;
let streak = 0;
let questionNumber = 1;
let answered = false;

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('question-number').textContent = questionNumber;
}

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function sampleWords(words, count) {
    return shuffleArray(words).slice(0, count);
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function loadAllWords() {
    const response = await fetch('/api/words');
    if (!response.ok) {
        throw new Error('Could not load words from database.');
    }

    const words = await response.json();

    if (!Array.isArray(words) || words.length < 4) {
        throw new Error('Not enough words in the database for quiz.');
    }

    allWords = words;
}

async function buildQuestion() {
    answered = false;

    const choices = sampleWords(allWords, 4);

    const detailResponses = await Promise.all(
        choices.map(word =>
            fetch(`/api/words/${encodeURIComponent(word)}`).then(res => {
                if (!res.ok) {
                    throw new Error(`Could not load details for word: ${word}`);
                }
                return res.json();
            })
        )
    );

    const correctIndex = Math.floor(Math.random() * detailResponses.length);
    const target = detailResponses[correctIndex];

    currentQuestion = {
        targetWord: target.word,
        options: shuffleArray(detailResponses.map(item => item.word)),
        lemmas: (target.lemmas || []).slice(0, 4),
        collocations: (target.collocations || []).slice(0, 3)
    };

    renderQuestion();
}

function renderQuestion() {
    const quizArea = document.getElementById('quiz-area');

    const lemmaChips = currentQuestion.lemmas.length
        ? currentQuestion.lemmas.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')
        : '<span class="chip">No lemma clue</span>';

    const collocationChips = currentQuestion.collocations.length
        ? currentQuestion.collocations.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')
        : '<span class="chip">No collocation clue</span>';

    const optionButtons = currentQuestion.options.map(word => `
        <button class="option-btn" data-word="${escapeHtml(word)}" onclick="selectAnswer('${encodeURIComponent(word)}')">
            ${escapeHtml(word)}
        </button>
    `).join('');

    quizArea.innerHTML = `
        <div class="prompt-box">
            <div class="prompt-title">Which word matches these clues?</div>

            <div class="clue-group">
                <div class="clue-label">Word family</div>
                <div class="chip-wrap">${lemmaChips}</div>
            </div>

            <div class="clue-group">
                <div class="clue-label">Common collocations</div>
                <div class="chip-wrap">${collocationChips}</div>
            </div>
        </div>

        <div class="option-grid">${optionButtons}</div>

        <div class="feedback" id="feedback"></div>

        <div class="actions">
            <button class="primary-btn" id="next-btn" onclick="nextQuestion()" style="display:none;">Next Question</button>
            <button class="secondary-btn" onclick="restartQuiz()">Restart Quiz</button>
        </div>
    `;
}

window.selectAnswer = function(encodedWord) {
    if (answered) return;
    answered = true;

    const chosenWord = decodeURIComponent(encodedWord);
    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');

    buttons.forEach(button => {
        button.disabled = true;
        const buttonWord = button.getAttribute('data-word');

        if (buttonWord === currentQuestion.targetWord) {
            button.classList.add('correct');
        }

        if (buttonWord === chosenWord && chosenWord !== currentQuestion.targetWord) {
            button.classList.add('wrong');
        }
    });

    if (chosenWord === currentQuestion.targetWord) {
        score += 1;
        streak += 1;
        feedback.textContent = `Correct! "${currentQuestion.targetWord}" is the right answer.`;
    } else {
        streak = 0;
        feedback.textContent = `Not quite. The correct answer is "${currentQuestion.targetWord}".`;
    }

    updateStats();
    document.getElementById('next-btn').style.display = 'inline-block';
};

window.nextQuestion = async function() {
    questionNumber += 1;
    updateStats();
    document.getElementById('quiz-area').innerHTML = '<div class="loading">Loading next question...</div>';

    try {
        await buildQuestion();
    } catch (error) {
        showError(error.message);
    }
};

window.restartQuiz = async function() {
    score = 0;
    streak = 0;
    questionNumber = 1;
    updateStats();
    document.getElementById('quiz-area').innerHTML = '<div class="loading">Restarting quiz...</div>';

    try {
        await buildQuestion();
    } catch (error) {
        showError(error.message);
    }
};

function showError(message) {
    document.getElementById('quiz-area').innerHTML = `
        <div class="error-box">⚠️ ${escapeHtml(message)}</div>
    `;
}

(async function init() {
    updateStats();

    try {
        await loadAllWords();
        await buildQuestion();
    } catch (error) {
        console.error(error);
        showError(error.message || 'Something went wrong while loading the quiz.');
    }
})();