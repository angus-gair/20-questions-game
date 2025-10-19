#!/usr/bin/env node

/**
 * Automated test script for 20 Questions game
 * Tests complete game flow without revealing answers to the AI
 */

const https = require('https');

const API_URL = 'https://20.ajinsights.com.au/api/question';

// Test configurations for different items
const testItems = {
  apple: {
    name: 'Apple',
    answers: {
      'living thing': 'yes',
      'animal': 'no',
      'plant': 'yes',
      'eat': 'yes',
      'fruit': 'yes',
      'vegetable': 'no',
      'grows on tree': 'yes',
      'seeds': 'yes',
      'red': 'maybe', // can be red, green, yellow
      'green': 'maybe',
      'yellow': 'maybe',
      'round': 'yes',
      'sweet': 'yes',
      'tropical': 'no',
      'citrus': 'no',
      'berry': 'no',
      'stone fruit': 'no',
      'banana': 'no',
      'orange': 'no',
      'apple': 'yes',
    }
  },
  truck: {
    name: 'Truck',
    answers: {
      'living thing': 'no',
      'animal': 'no',
      'plant': 'no',
      'man-made': 'yes',
      'vehicle': 'yes',
      'car': 'no',
      'transport': 'yes',
      'wheels': 'yes',
      'engine': 'yes',
      'bigger than car': 'yes',
      'fly': 'no',
      'water': 'no',
      'road': 'yes',
      'truck': 'yes',
    }
  },
  cow: {
    name: 'Cow',
    answers: {
      'living thing': 'yes',
      'animal': 'yes',
      'plant': 'no',
      'mammal': 'yes',
      'pet': 'no',
      'farm': 'yes',
      'wild': 'no',
      'eat it': 'yes',
      'milk': 'yes',
      'four legs': 'yes',
      'horse': 'no',
      'pig': 'no',
      'sheep': 'no',
      'cow': 'yes',
    }
  }
};

async function makeRequest(history, difficulty = 'normal', maxQuestions = 20) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ history, difficulty, maxQuestions });

    const options = {
      hostname: '20.ajinsights.com.au',
      port: 443,
      path: '/api/question',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function findAnswer(question, itemAnswers) {
  const q = question.toLowerCase();

  // Try to match keywords in the question to our predefined answers
  for (const [key, answer] of Object.entries(itemAnswers)) {
    if (q.includes(key.toLowerCase())) {
      return answer;
    }
  }

  // Default answers based on question patterns
  if (q.includes('is it')) {
    // Default to 'no' for unmatched specific guesses
    if (q.includes('is it a ') || q.includes('is it an ')) {
      return 'no';
    }
  }

  return 'maybe'; // When unsure
}

async function playGame(itemKey) {
  const item = testItems[itemKey];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${item.name}`);
  console.log('='.repeat(60));

  const history = [];
  let questionNumber = 0;
  let gameOver = false;
  const maxQuestions = 20;

  try {
    while (!gameOver && questionNumber < maxQuestions) {
      // Get next question
      const response = await makeRequest(history, 'normal', maxQuestions);

      if (response.error) {
        console.error(`\n❌ Error: ${response.error}`);
        console.error(`Details: ${response.details || 'No details'}`);
        return { success: false, error: response.error, questionNumber };
      }

      questionNumber++;
      const question = response.question;
      const isGuess = response.isGuess;

      console.log(`\nQ${questionNumber}: ${question}`);
      console.log(`Is Guess: ${isGuess ? 'YES' : 'NO'}`);

      // Check if it's the final guess for the correct item
      const qLower = question.toLowerCase();
      const correctGuess = qLower.includes(itemKey.toLowerCase()) ||
                          qLower.includes(item.name.toLowerCase());

      if (isGuess && correctGuess) {
        console.log(`✅ Answer: YES (Correct guess!)`);
        console.log(`\n🎉 Game Won! AI guessed correctly in ${questionNumber} questions!`);
        return { success: true, won: true, questionNumber };
      }

      // Find appropriate answer based on question content
      const answer = findAnswer(question, item.answers);
      console.log(`✅ Answer: ${answer.toUpperCase()}`);

      // Add to history - clean the question text for JSON safety
      history.push({
        question: question.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''), // Remove control characters
        answer,
        questionNumber
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (questionNumber >= maxQuestions) {
      console.log(`\n❌ Game Lost! AI ran out of questions (${questionNumber}/${maxQuestions})`);
      return { success: true, won: false, questionNumber };
    }

  } catch (error) {
    console.error(`\n❌ Test Failed: ${error.message}`);
    console.error(error.stack);
    return { success: false, error: error.message, questionNumber };
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('20 Questions Game - Automated Test Suite');
  console.log('='.repeat(60));
  console.log('Testing production: https://20.ajinsights.com.au');
  console.log('');

  const results = {};

  for (const itemKey of Object.keys(testItems)) {
    const result = await playGame(itemKey);
    results[itemKey] = result;

    // Wait between games
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  let allPassed = true;
  for (const [item, result] of Object.entries(results)) {
    const emoji = result.success ? '✅' : '❌';
    const status = result.success
      ? (result.won ? `Won in ${result.questionNumber} questions` : `Lost after ${result.questionNumber} questions`)
      : `Failed: ${result.error}`;

    console.log(`${emoji} ${item.toUpperCase().padEnd(10)}: ${status}`);

    if (!result.success) {
      allPassed = false;
    }
  }

  console.log('='.repeat(60));
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  console.log('='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
