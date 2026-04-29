let reviewWords = [];
let allWords = [];

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const selectedWord = params.get('word');

    // allWords comes from the real database through /api/words
    const wordsResponse = await fetch('/api/words');

    if (!wordsResponse.ok) {
        throw new Error('Could not load all words from database.');
    }

    allWords = await wordsResponse.json();

    if (selectedWord) {
        const reviewResponse = await fetch('/api/review-words');

        if (!reviewResponse.ok) {
            throw new Error('Could not load review words.');
        }

        const allReviewWords = await reviewResponse.json();
        const matchedWord = allReviewWords.find(item => item.word === selectedWord);

        reviewWords = [
            {
                word: selectedWord,
                errors: matchedWord ? matchedWord.errors : 1
            }
        ];
    } else {
        const reviewResponse = await fetch('/api/review-words');

        if (!reviewResponse.ok) {
            throw new Error('Could not load review words.');
        }

        reviewWords = await reviewResponse.json();
    }
}

async function createQuiz(wordObj) {
    const word = wordObj.word;

    const detailResponse = await fetch(`/api/words/${encodeURIComponent(word)}`);

    if (!detailResponse.ok) {
        throw new Error(`Could not load details for "${word}".`);
    }

    const detail = await detailResponse.json();

    const wrongOptions = shuffleArray(
        allWords.filter(item => item !== word)
    ).slice(0, 3);

    const options = shuffleArray([word, ...wrongOptions]);

    return {
        word: word,
        errors: wordObj.errors,
        lemmas: detail.lemmas || [],
        collocations: detail.collocations || [],
        options: options
    };
}

function renderQuizCard(quiz, index) {
    const lemmaChips = quiz.lemmas.length
        ? quiz.lemmas.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')
        : '<span class="chip">No lemma clue</span>';

    const collocationChips = quiz.collocations.length
        ? quiz.collocations.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')
        : '<span class="chip">No collocation clue</span>';

    const optionButtons = quiz.options.map(option => {
        return `
            <button 
                class="option-btn"
                data-answer="${escapeHtml(quiz.word)}"
                data-option="${escapeHtml(option)}"
                onclick="checkAnswer(this)"
            >
                ${escapeHtml(option)}
            </button>
        `;
    }).join('');

    return `
        <div class="quiz-card">
            <h2>Question ${index + 1}</h2>

            <p class="mistake-text">
                You made ${quiz.errors} mistake(s) with this word.
            </p>

            <h3>Word Family</h3>
            <div class="chips">${lemmaChips}</div>

            <h3>Common Collocations</h3>
            <div class="chips">${collocationChips}</div>

            <h3>Choose the correct word:</h3>
            <div class="options">
                ${optionButtons}
            </div>

            <div class="feedback"></div>
        </div>
    `;
}

function checkAnswer(button) {
    const card = button.closest('.quiz-card');
    const buttons = card.querySelectorAll('.option-btn');
    const feedback = card.querySelector('.feedback');

    const correctAnswer = button.dataset.answer;
    const chosenAnswer = button.dataset.option;

    buttons.forEach(btn => {
        btn.disabled = true;

        if (btn.dataset.option === correctAnswer) {
            btn.classList.add('correct');
        }

        if (btn.dataset.option === chosenAnswer && chosenAnswer !== correctAnswer) {
            btn.classList.add('wrong');
        }
    });

    if (chosenAnswer === correctAnswer) {
        feedback.textContent = `Correct! The answer is "${correctAnswer}".`;
        feedback.style.color = '#2ECC71';
    } else {
        feedback.textContent = `Wrong. The correct answer is "${correctAnswer}".`;
        feedback.style.color = '#E74C3C';
    }
}

async function init() {
    const container = document.getElementById('quiz-container');

    try {
        await loadData();

        const quizzes = await Promise.all(
            reviewWords.map(wordObj => createQuiz(wordObj))
        );

        container.innerHTML = quizzes.map((quiz, index) => {
            return renderQuizCard(quiz, index);
        }).join('');

    } catch (error) {
        container.innerHTML = `
            <div class="quiz-card">
                <h2>Could not load quiz.</h2>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
        console.error(error);
    }
}

init();
