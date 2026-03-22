import sys
import json
import traceback
from gramformer import Gramformer
import torch

def set_seed(seed):
    """Set random seed for reproducibility"""
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

# Initialize with fixed seed
set_seed(1212)

def get_explanation(error_type, original, correction):
    """Convert Gramformer error codes to user-friendly explanations"""
    
    explanations = {
        'VERB:SVA': f'Subject-verb agreement: "{original}" should be "{correction}" to match the subject.',
        'VERB:FORM': f'Verb tense: Use "{correction}" instead of "{original}".',
        'VERB:INFL': f'Verb inflection: "{original}" should be "{correction}".',
        'MORPH': f'Word form: "{original}" is wrong. Use "{correction}".',
        'NOUN:INFL': f'Noun form: "{original}" should be "{correction}".',
        'NOUN:NUM': f'Number agreement: Use "{correction}" instead of "{original}".',
        'DET': f'Article error: Try "{correction}" instead of "{original}".',
        'PREP': f'Preposition: Use "{correction}" instead of "{original}".',
        'CONJ': f'Conjunction: Use "{correction}" instead of "{original}".',
        'ADJ:FORM': f'Adjective form: "{original}" should be "{correction}".',
        'ADV:FORM': f'Adverb form: "{original}" should be "{correction}".',
        'SPELL': f'Spelling: "{original}" should be "{correction}".',
    }
    
    # Default explanation if error type not found
    return explanations.get(error_type, f'Try "{correction}" instead of "{original}".')

def check_grammar(sentence, target_word):
    """
    Analyze sentence grammar using Gramformer
    Returns: dict with corrections, edits, and explanations
    """
    try:
        print("Loading Gramformer...", file=sys.stderr)
        gf = Gramformer(models=1, use_gpu=torch.cuda.is_available())
        print("Gramformer loaded!", file=sys.stderr)
        
        # Initialize result structure
        result = {
            'original': sentence,
            'target_word': target_word,
            'has_target': target_word.lower() in sentence.lower(),
            'correction': None,
            'edits': [],
            'explanations': []
        }
        
        # Get grammar corrections
        corrections = gf.correct(sentence)
        
        # Convert set to list if needed
        if isinstance(corrections, set):
            corrections = list(corrections)
        
        # Process corrections if any
        if corrections and len(corrections) > 0:
            corrected_sentence = corrections[0]
            result['correction'] = corrected_sentence
            
            # Get detailed edits (original → corrected)
            try:
                edits = gf.get_edits(sentence, corrected_sentence)
                
                if edits:
                    for edit in edits:
                        # Edit format: (error_type, original_word, start, end, corrected_word, cor_start, cor_end)
                        error_type = edit[0]
                        original_word = edit[1]
                        corrected_word = edit[4]
                        
                        edit_info = {
                            'type': error_type,
                            'original': original_word,
                            'correction': corrected_word,
                            'explanation': get_explanation(error_type, original_word, corrected_word)
                        }
                        result['edits'].append(edit_info)
                        result['explanations'].append(edit_info['explanation'])
                        
            except Exception as edit_error:
                print(f"Edit extraction error: {edit_error}", file=sys.stderr)
                # Fallback: just show the correction
                if corrected_sentence != sentence:
                    result['explanations'].append(
                        f"Suggested: '{corrected_sentence}'"
                    )
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'traceback': traceback.format_exc()
        }

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments'}))
        sys.exit(1)
    
    # Get sentence and target word from command line
    sentence = sys.argv[1]
    target_word = sys.argv[2]
    
    # Run grammar check and output JSON
    result = check_grammar(sentence, target_word)
    print(json.dumps(result))