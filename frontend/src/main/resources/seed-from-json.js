const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'awl.db');
const db = new sqlite3.Database(dbPath);

if (!fs.existsSync('awl-words-with-coll.json')) {
  console.error('Error: awl-words-with-coll.json not found!');
  console.log('Please run node parse-locra.js first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync('awl-words-with-coll.json', 'utf8'));
console.log(`Loaded ${data.length} words from JSON file.`);

db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  const insertWord = db.prepare('INSERT OR IGNORE INTO words (word, correct_example) VALUES (?, ?)');
  const insertLemma = db.prepare('INSERT INTO lemmas (word_id, lemma) VALUES (?, ?)');
  const insertColl = db.prepare('INSERT INTO collocations (word_id, collocation) VALUES (?, ?)');

  const insertGlobalRule = db.prepare(`
    INSERT OR IGNORE INTO guidance_rules (word_id, rule_type, message, priority)
    VALUES (NULL, 'must_contain_lemma', 'Your sentence does not contain any form of the target word. Try using the word or a related form.', 1)
  `);
  insertGlobalRule.run();

  let wordCount = 0;
  let lemmaCount = 0;
  let collCount = 0;

  data.forEach((item, index) => {
    insertWord.run(item.word, `Example sentence using ${item.word}.`, function(err) {
      if (err) {
        console.error(`Error inserting word ${item.word}:`, err);
      } else {
        const wordId = this.lastID;
        wordCount++;
        
        if (item.lemmas && item.lemmas.length > 0) {
          item.lemmas.forEach(lemma => {
            insertLemma.run(wordId, lemma);
            lemmaCount++;
          });
        }

        if (item.collocations && item.collocations.length > 0) {
          item.collocations.forEach(coll => {
            insertColl.run(wordId, coll);
            collCount++;
          });
        }
      }
      
      if (index === data.length - 1) {
        setTimeout(() => {
          insertWord.finalize();
          insertLemma.finalize();
          insertColl.finalize();
          insertGlobalRule.finalize();

          db.run('COMMIT', err => {
            if (err) {
              console.error('Commit failed:', err);
            } else {
              console.log('\n=== SEEDING COMPLETE ===');
              console.log(`Words inserted: ${wordCount}`);
              console.log(`Lemmas inserted: ${lemmaCount}`);
              console.log(`Collocations inserted: ${collCount}`);
              console.log('Database is ready to use!');
            }
            db.close();
          });
        }, 1000);
      }
    });
  });
});