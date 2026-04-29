import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getErrorMessage } from "./error_map.js"
import { Client } from "@saplingai/sapling-js/client";

const apiKey = 'WNCO3DI2MG77P3GX4MH1F72QAOPNCRRH';
const client = new Client(apiKey);


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

    
const __dirname = dirname(fileURLToPath(import.meta.url));

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
      let fullSentence = null;
      let errorMessage = null;
      let basicerror = null;
      let status = false;


      //send sentence to sapling
      client.edits(sentence)
      .then((response) =>{

        try {
          let edit = response.data.edits[0];
          
          if (typeof edit.start === undefined) {
            fullSentence = sentence;
          }

          else {
            let sentence_one = sentence.slice(0, edit.start);
            let sentence_two = sentence.slice(edit.end, sentence.length);
            fullSentence = sentence_one + edit.replacement + sentence_two;
            errorMessage = edit.description;
            basicerror = edit.error_type;
          }

          //get user_id
          //let cookie = document.cookie;
          db.all('INSERT INTO user_scores (user_id, word_id, results), VALUES (?, ?, ?);', [user, word, basicerror], (err, results) => {
            if (err) {
              results.status(500).json({ error: err.message });
              return;
            }
          })
        }

        catch (e) {
          if (e instanceof TypeError) {
            status = true;
          }
          else {
            console.log(e);
          }
        }

        res.json({
          status, fullSentence, errorMessage
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