import wordList from '../../Dictionary/SATwords.json';

// This function gives a "random" but consistent word each day
export function getWordOfTheDay(difficulty = "medium") {
    const words = wordList[difficulty];
    if (!words || words.length === 0) return "";

    const now = new Date();
    const start = new Date(Date.UTC(2024, 5, 7)); //June 7 2025
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const daysSince = Math.floor((nowUTC - start.getTime()) / (1000 * 60 * 60 * 24));

    
    const pseudoRandomIndex = (daysSince * 17 + 43) % words.length;

    return words[pseudoRandomIndex].toUpperCase();
}