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

//session
import session from 'express-session';

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


// POST new account
app.use(express.json())
app.post('/api/signup', (req, res) => {
  
  const { name, email, password } = req.body;


  const sql = `INSERT INTO users(name, email, password) VALUES(?, ?,?)`;
  db.all(sql, [name, email, password], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send(`User added with ID`);
  });

});


// check if acc pw is real
app.use(express.json())
app.post('/api/auth', (req, res) => {
  

  console.log("verifying user data");




  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.all(sql, [email, password], (err, result) => {




    if (result.length > 0) {

      res.status(200).json({ user: result[0].user_id });
    } else {

      console.log("No user found ");

      res.status(401).json({ user: 0});
    }

  });
});


// get all account info
app.use(express.json())
app.get('/api/profile', (req, res) => {

  const { id } = req.body;
  const sql = "SELECT * FROM users WHERE user_id = ?";
  db.all(sql, [id], (err, result) => {

    if (result.length > 0) {
      res.status(200).json({ user: result[0] });
    } else {
      console.log("No user found ");
      res.status(401).json({ user: 0});
    }

  });
});

// get all results info
app.use(express.json())
app.get('/api/profile', (req, res) => {
    // resend user data
    const user = req.session.user;
    res.send(`Welcome ${user.username}`);

  const { id, word } = req.body;
  const sql = "SELECT * FROM user_scores WHERE user_id = ? AND word = ?";
  db.all(sql, [id, word], (err, result) => {

    if (result.length > 0) {
      res.status(200).json({ user: result[0] });
    } else {
      console.log("No attempts found ");
      res.status(401).json({ user: 0});
    }

  });
});

/*
app.get('/api/login', (req, res) => {
    // set logged in
    console.log("logged in");
    req.session.user =
        { id: 1, username: 'example' };
    res.send('Logged in');
});



app.get('/api/logout',
    (req, res) => {
        // log out
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error logging out');
            } else {
                res.send('Logged out');
            }
        });
    });*/



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