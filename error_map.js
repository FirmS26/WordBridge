let error_map = new Map();
error_map = {"M:PART":"You are missing a particle.",
"M:PUNCT":"You are missing some punctuation.",
"M:CONJ": "You are missing conjugation.",
"M:DET": "You are missing a determiner.",
"M:DET:ART": "You are missing a particle.",
"M:PART": "You are missing a particle.",
"M:PREP":"You are missing a preposition.",
"M:PRON": "You are missing a pronoun.",
"M:VERB": "You are missing a verb.",
"M:ADJ": "You are missing an adjective",
"M:NOUN": "You are missing a noun.",
"M:NOUN:POSS":"You are missing a possessive noun.",
"M:OTHER":"You are missing something.",
"R:PART":"You have an incorrect particle.",
"R:PUNCT":"Your punctuation is incorrect.",
"R:ORTH":"Your orthography is incorrect.",
"R:SPELL":"Your spelling is incorrect.",
"R:WO":"Your word order is incorrect.",
"R:MORPH":"You have the right word but the wrong form.",
"R:ADV":"You have an incorrect adverb.",
"R:CONTR":"Your contraction is incorrect.",
"R:CONJ":"Your conjugation is incorrect.",
"R:DET":"You have an incorrect determinant.",
"R:DET:ART":"You have an incorrect article.",
"R:PREP":"YOu have an inocorrect preposition.",
"R:PRON":"You have an incorrect pronoun.",
"R:VERB:FORM":"You have an incorrect verb form.",
"R:VERB:TENSE":"A verb is in the incorrect tense.",
"R:VERB:SVA":"The subject and the verb do not agree.",
"R:ADJ:FORM":"The adjective form is wrong.",
"R:NOUN:INFL":"The noun inflection is incorrect.",
"R:NOUN:NUM":"Incorrect noun number.",
"R:OTHER":"",

}

export function getErrorMessage(error,word) {
    let error_message = error_map.get(error);
    let splitted = error.split(0,2);
    if (splitted[0]=="M") {
        return error_message + ` Try adding ${word}: `
    }

    if (splitted[0]=="R") {
        return error_message + ` Try using ${word}.`
    }
    
}