const fs = require('fs');
const { createInterface } = require('readline');

// ==================== LOAD AWL WORDS ====================
const awlWords = JSON.parse(fs.readFileSync('awl-words.json', 'utf8'));
const wordSet = new Set(awlWords.map(w => w.word.toLowerCase()));

// Add all lemmas to the search set
awlWords.forEach(w => {
  w.lemmas.forEach(lemma => {
    wordSet.add(lemma.toLowerCase());
  });
});

console.log(`Loaded ${awlWords.length} AWL words with ${wordSet.size} total lemmas.`);

// ==================== PROCESS LOCRA DATABASE ====================
const collocationsMap = {};
console.log('Reading LOCRA database (141MB file)...');

const rl = createInterface({
  input: fs.createReadStream('locra_dependencies.tsv'),
  crlfDelay: Infinity
});

let lineCount = 0;
let matchCount = 0;
let headerSkipped = false;

rl.on('line', (line) => {
  lineCount++;
  
  // Skip header line
  if (!headerSkipped) {
    headerSkipped = true;
    return;
  }
  
  const columns = line.split('\t');
  
  // LOCRA column structure:
  // 0: dep (relation type)     e.g., "acomp", "amod", "nsubj"
  // 1: item_a (base word)      e.g., "analyse"
  // 2: item_b (collocate)      e.g., "data"
  // 3: pos_a (POS of base)
  // 4: pos_b (POS of collocate)
  
  const baseWord = columns[1]?.toLowerCase().trim();
  const collocateWord = columns[2]?.toLowerCase().trim();
  const relation = columns[0]?.toLowerCase().trim();
  
  if (!baseWord || !collocateWord) return;
  
  // Check if this base word is in our AWL list
  if (wordSet.has(baseWord)) {
    matchCount++;
    
    if (!collocationsMap[baseWord]) {
      collocationsMap[baseWord] = [];
    }
    
    // Create meaningful collocation phrase based on relation type
    let collocation;
    
    if (relation === 'amod' || relation.includes('mod')) {
      // Adjective modifier: "significant analysis"
      collocation = `${collocateWord} ${baseWord}`;
    } else if (relation === 'nsubj' || relation === 'nsubjpass') {
      // Nominal subject: "analysis shows"
      collocation = `${baseWord} ${collocateWord}`;
    } else if (relation === 'dobj' || relation === 'obj') {
      // Direct object: "conduct analysis"
      collocation = `${collocateWord} ${baseWord}`;
    } else if (relation === 'prep' || relation.includes('prep')) {
      // Prepositional: "analysis of data"
      collocation = `${baseWord} of ${collocateWord}`;
    } else if (relation === 'advmod') {
      // Adverb modifier: "carefully analyze"
      collocation = `${collocateWord} ${baseWord}`;
    } else {
      // Default: just show the pair
      collocation = `${baseWord} ${collocateWord}`;
    }
    
    // Avoid duplicates and limit to 15 per word
    const isDuplicate = collocationsMap[baseWord].some(
      existing => existing.toLowerCase() === collocation.toLowerCase()
    );
    
    if (!isDuplicate && collocationsMap[baseWord].length < 15) {
      collocationsMap[baseWord].push(collocation);
    }
  }
  
  // Progress indicator every 100,000 lines
  if (lineCount % 100000 === 0) {
    console.log(`Processed ${lineCount} lines... (found ${matchCount} matches)`);
  }
});

rl.on('close', () => {
  console.log('\n=== LOCRA PARSING COMPLETE ===');
  console.log(`Total lines processed: ${lineCount}`);
  console.log(`Total matches found: ${matchCount}`);
  
  // Add collocations to AWL words
  let wordsWithCollocations = 0;
  awlWords.forEach(word => {
    const wordLower = word.word.toLowerCase();
    if (collocationsMap[wordLower]?.length > 0) {
      word.collocations = collocationsMap[wordLower];
      wordsWithCollocations++;
    } else {
      word.collocations = [];
    }
  });
  
  // Calculate statistics
  const totalCollocations = awlWords.reduce((sum, w) => sum + w.collocations.length, 0);
  
  console.log(`Words with collocations: ${wordsWithCollocations}/${awlWords.length}`);
  console.log(`Total collocations found: ${totalCollocations}`);
  
  // Save the enriched data
  fs.writeFileSync('awl-words-with-coll.json', JSON.stringify(awlWords, null, 2));
  console.log('\n✅ Saved to awl-words-with-coll.json');
  
  // Show sample
  if (awlWords.length > 0 && awlWords[0].collocations.length > 0) {
    console.log(`\nSample for "${awlWords[0].word}":`);
    console.log(awlWords[0].collocations.slice(0, 5));
  }
});