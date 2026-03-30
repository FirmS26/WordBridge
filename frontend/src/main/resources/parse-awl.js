const fs = require('fs');

// ==================== READ RAW AWL FILE ====================
const text = fs.readFileSync('awl-sublists.txt', 'utf8');
const lines = text.split('\n');

// ==================== PARSE WORD FAMILIES ====================
const words = [];
let currentHeadword = null;
let currentLemmas = [];
let started = false; // Flag to skip header text

lines.forEach(line => {
  const rawLine = line.replace(/\r$/, '');
  if (rawLine.trim() === '') return;

  // Skip everything until we reach the first sublist
  if (!started) {
    if (rawLine.includes('Sublist 1') || rawLine.includes('sublist 1')) {
      started = true;
    }
    return;
  }

  const isIndented = /^\s/.test(rawLine);

  if (!isIndented) {
    // This is a headword (not indented)
    
    // Skip sublist headers like "Sublist 2"
    if (rawLine.startsWith('Sublist') || rawLine.startsWith('sublist')) {
      return;
    }

    // Save the previous word before starting a new one
    if (currentHeadword) {
      const uniqueLemmas = [...new Set(currentLemmas)];
      if (!uniqueLemmas.includes(currentHeadword)) {
        uniqueLemmas.unshift(currentHeadword);
      }
      words.push({
        word: currentHeadword,
        lemmas: uniqueLemmas
      });
    }

    // Start new headword
    currentHeadword = rawLine.trim();
    currentLemmas = [];
  } else {
    // This is a lemma (indented)
    const lemma = rawLine.trim();
    if (lemma) currentLemmas.push(lemma);
  }
});

// Don't forget the last word
if (currentHeadword) {
  const uniqueLemmas = [...new Set(currentLemmas)];
  if (!uniqueLemmas.includes(currentHeadword)) {
    uniqueLemmas.unshift(currentHeadword);
  }
  words.push({
    word: currentHeadword,
    lemmas: uniqueLemmas
  });
}

// ==================== OUTPUT RESULTS ====================
console.log(`\n=== AWL PARSING COMPLETE ===`);
console.log(`Parsed ${words.length} words.`);
console.log('First 5 words:', words.slice(0, 5).map(w => w.word));

// Save to JSON file
fs.writeFileSync('awl-words.json', JSON.stringify(words, null, 2));
console.log('✅ Saved to awl-words.json');