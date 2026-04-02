import { getErrorMessage } from "./error_map.js"
import { Client } from "@saplingai/sapling-js/client";

const apiKey = '1ZVMSP3ZQ10U3VLEEMLU725YY0JS9LMS';
const client = new Client(apiKey);


export async function getSaplingInfo(sentence){
    console.log(sentence);
    client.edits(sentence)
    .then((response) =>{
        console.log('response is: ');
        console.log(response.data);
        let correctSentence = getNewSentence(sentence, response.replacement, response.start, response.end);
        return {"sentence":correctSentence}
    })
    
}

function getNewSentence(sentence, replacement, start, end) {
    console.log(sentence);
    let sentences = sentence.split(start, end)
    let fullSentence = sentences[0] + replacement + sentences[2];
    console.log("Correct sentence is " + fullSentence);
    return fullSentence;
}
