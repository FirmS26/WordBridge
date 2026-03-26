function tryAgain() {
  const word = document.getElementById('word').textContent;
  window.location.href = `word.html?word=${encodeURIComponent(word)}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightWordInSentence(sentence, word) {
  const safeSentence = escapeHtml(sentence);

  if (!word) {
    return `<strong>"${safeSentence}"</strong>`;
  }

  const pattern = new RegExp(`(${escapeRegExp(word)})`, 'gi');
  const highlighted = safeSentence.replace(
    pattern,
    '<span class="sentence-match">$1</span>'
  );

  return `<strong>"${highlighted}"</strong>`;
}

function renderChipList(container, items, emptyMessage) {
  container.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-text';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const span = document.createElement('span');
    span.textContent = item;
    container.appendChild(span);
  });
}

function updateStatus(guidanceText) {
  const statusBox = document.getElementById('result-status');
  const statusText = document.getElementById('status-text');
  const normalized = (guidanceText || '').toLowerCase();

  const isSuccess =
    normalized.includes('great!') ||
    normalized.includes('uses the word correctly');

  statusBox.className = `result-status ${isSuccess ? 'success' : 'warning'}`;
  statusBox.querySelector('.status-icon').textContent = isSuccess ? '✅' : '💡';
  statusText.textContent = isSuccess
    ? 'Good job! Your sentence looks correct.'
    : 'Needs improvement. Check the guidance below.';
}

(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const word = urlParams.get('word');
  const sentence = urlParams.get('sentence');

  if (!word || !sentence) {
    window.location.href = 'words.html';
    return;
  }

  document.getElementById('word').textContent = word;
  document.getElementById('sentence-display').innerHTML =
    highlightWordInSentence(sentence, word);

  try {
    const wordRes = await fetch(`/api/words/${encodeURIComponent(word)}`);
    if (!wordRes.ok) throw new Error('Word not found');
    const wordData = await wordRes.json();

    renderChipList(
      document.getElementById('lemmas'),
      wordData.lemmas,
      'No extra word forms available for this word yet.'
    );

    renderChipList(
      document.getElementById('collocations'),
      wordData.collocations,
      'No common collocations available for this word yet.'
    );

    const feedbackRes = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, sentence })
    });

    if (!feedbackRes.ok) throw new Error('Feedback failed');
    const feedback = await feedbackRes.json();

    document.getElementById('guidance').textContent = feedback.guidance;
    document.getElementById('correct-answer').textContent =
      feedback.correctAnswer || 'Example: Try using the word in a sentence.';
    updateStatus(feedback.guidance);
  } catch (error) {
    document.getElementById('guidance').innerHTML =
      '<span class="error">⚠️ Error loading results. Please try again.</span>';

    document.getElementById('correct-answer').textContent =
      'Example: Try using the word in a sentence.';

    renderChipList(
      document.getElementById('lemmas'),
      [],
      'No extra word forms available for this word yet.'
    );

    renderChipList(
      document.getElementById('collocations'),
      [],
      'No common collocations available for this word yet.'
    );

    document.getElementById('result-status').className = 'result-status warning';
    document.getElementById('result-status').querySelector('.status-icon').textContent = '⚠️';
    document.getElementById('status-text').textContent =
      'Something went wrong while loading the result.';

    console.error('Error:', error);
  }
})();