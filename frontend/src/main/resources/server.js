const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'awl.db'));

// ==================== API ROUTES ====================

// GET all words
app.get('/api/words', (req, res) => {
  db.all('SELECT word FROM words ORDER BY word', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.word));
  });
});

// GET specific word details
app.get('/api/words/:word', (req, res) => {
  const word = req.params.word;
  
  db.get('SELECT id, word, correct_example FROM words WHERE word = ?', [word], (err, wordRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!wordRow) {
      res.status(404).json({ error: 'Word not found' });
      return;
    }

    const wordId = wordRow.id;
    
    // Get lemmas for this word
    db.all('SELECT lemma FROM lemmas WHERE word_id = ?', [wordId], (err, lemmaRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get collocations for this word
      db.all('SELECT collocation FROM collocations WHERE word_id = ?', [wordId], (err, collRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          word: wordRow.word,
          lemmas: lemmaRows.map(r => r.lemma),
          collocations: collRows.map(r => r.collocation),
          correctExample: wordRow.correct_example
        });
      });
    });
  });
});

// POST feedback on user sentence
app.post('/api/feedback', (req, res) => {
  const { word, sentence } = req.body;
  const lowerSentence = sentence.toLowerCase();

  db.get('SELECT id, correct_example FROM words WHERE word = ?', [word], (err, wordRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!wordRow) {
      res.status(404).json({ error: 'Word not found' });
      return;
    }

    const wordId = wordRow.id;

    // Get all lemmas for this word
    db.all('SELECT lemma FROM lemmas WHERE word_id = ?', [wordId], (err, lemmaRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const lemmas = lemmaRows.map(r => r.lemma.toLowerCase());

      // Get applicable rules
      db.all('SELECT * FROM guidance_rules WHERE word_id = ? OR word_id IS NULL ORDER BY priority', [wordId], (err, rules) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        let guidance = null;
        let correctExample = wordRow.correct_example;

        // Check each rule
        for (const rule of rules) {
          let failed = false;
          
          // Rule: Sentence must contain at least one lemma form
          if (rule.rule_type === 'must_contain_lemma') {
            const lemmaFound = lemmas.some(lemma => lowerSentence.includes(lemma));
            if (!lemmaFound) failed = true;
          }
          
          // If rule failed, use its message
          if (failed) {
            guidance = rule.message;
            if (rule.correct_example) correctExample = rule.correct_example;
            break;
          }
        }

        // If no rules failed, sentence is good
        if (!guidance) {
          guidance = "Great! Your sentence uses the word correctly.";
        }

        res.json({
          guidance,
          correctAnswer: correctExample
        });
      });
    });
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Database connected with all AWL words!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed.');
  process.exit();
});