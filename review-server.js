const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Use the real database from main project
const dbPath = path.join(__dirname, 'awl.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to awl.db:', err.message);
    } else {
        console.log('Connected to awl.db');
    }
});

// Temporary review words.
// Later, this can come from user_scores or backend feedback.
const reviewWords = [
    { word: 'analyse', errors: 7, lastAttempt: '2024-03-26', difficulty: 'hard', commonMistake: 'verb form' },
    { word: 'approach', errors: 4, lastAttempt: '2024-03-25', difficulty: 'medium', commonMistake: 'preposition' },
    { word: 'context', errors: 3, lastAttempt: '2024-03-24', difficulty: 'medium', commonMistake: 'article usage' },
    { word: 'significant', errors: 2, lastAttempt: '2024-03-23', difficulty: 'easy', commonMistake: 'spelling' },
    { word: 'assess', errors: 5, lastAttempt: '2024-03-22', difficulty: 'hard', commonMistake: 'noun vs verb' },
    { word: 'establish', errors: 3, lastAttempt: '2024-03-21', difficulty: 'medium', commonMistake: 'collocation' },
    { word: 'concept', errors: 1, lastAttempt: '2024-03-20', difficulty: 'easy', commonMistake: 'definition' },
    { word: 'methodology', errors: 6, lastAttempt: '2024-03-19', difficulty: 'hard', commonMistake: 'pronunciation' },
    { word: 'variable', errors: 2, lastAttempt: '2024-03-18', difficulty: 'easy', commonMistake: 'plural form' },
    { word: 'theory', errors: 4, lastAttempt: '2024-03-17', difficulty: 'medium', commonMistake: 'vs hypothesis' },
    { word: 'indicate', errors: 5, lastAttempt: '2024-03-16', difficulty: 'hard', commonMistake: 'verb tense' },
    { word: 'obtain', errors: 2, lastAttempt: '2024-03-15', difficulty: 'easy', commonMistake: 'collocation' }
];

// Send review words to review page and quiz page
app.get('/api/review-words', (req, res) => {
    res.json(reviewWords);
});

// Get all words from the real database
// This is the allWords source.
app.get('/api/words', (req, res) => {
    const sql = 'SELECT word FROM words ORDER BY word';

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json(rows.map(row => row.word));
    });
});

// Get one word's details from the real database
app.get('/api/words/:word', (req, res) => {
    const word = req.params.word;

    db.get(
        'SELECT id, word, correct_example FROM words WHERE word = ?',
        [word],
        (err, wordRow) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!wordRow) {
                res.status(404).json({ error: 'Word not found' });
                return;
            }

            const wordId = wordRow.id;

            db.all(
                'SELECT lemma FROM lemmas WHERE word_id = ?',
                [wordId],
                (err, lemmaRows) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    db.all(
                        'SELECT collocation FROM collocations WHERE word_id = ?',
                        [wordId],
                        (err, collocationRows) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }

                            res.json({
                                word: wordRow.word,
                                lemmas: lemmaRows.map(row => row.lemma),
                                collocations: collocationRows.map(row => row.collocation),
                                correctExample: wordRow.correct_example
                            });
                        }
                    );
                }
            );
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});