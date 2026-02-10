/**
 * Test script for Quiz Generation System
 * Run with: node test-quiz-generation.js
 */

import { generateQuiz } from './src/services/gemini.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample transcript for testing
const sampleTranscript = `
Welcome to this comprehensive tutorial on JavaScript closures. Today I'm going to explain one of the most powerful features of JavaScript that often confuses beginners.

First, let me start with a common misconception. Many developers think that a closure is created every time a function is CALLED. This is wrong. Closures are actually created when a function is DEFINED, not when it's executed. This is a crucial distinction that I'll demonstrate in a moment.

Let's start with a simple example. I'll show you how to create a counter function using closures. The key here is that we want to make the count variable private, so it can't be accessed or modified from outside.

[Demonstrates code on screen]

function createCounter() {
  let count = 0;
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}

As you can see, the count variable is enclosed in the scope of createCounter. The three methods we're returning maintain access to this count variable even after createCounter has finished executing. This is the power of closures.

Now, let me warn you about a very common mistake that beginners make with closures in loops. Watch what happens when we try to create multiple click handlers in a loop...

[Shows problematic code]

for (var i = 0; i < 5; i++) {
  buttons[i].onclick = function() {
    console.log(i);
  };
}

The problem here is that all the closures end up referencing the same variable i. By the time any button is clicked, the loop has completed and i is 5. So all buttons will log 5. This is wrong!

The solution is to either use 'let' instead of 'var', which creates a new binding for each iteration, or to use an IIFE to capture the current value of i.

Another important concept I want to explain is how closures relate to memory management. Some developers worry that closures cause memory leaks. This isn't entirely accurate. While it's true that closures keep references to their outer scope, JavaScript's garbage collector is smart enough to clean up what's not being used.

However, you do need to be careful. If you create a closure that references a large object, and you keep that closure around, the object won't be garbage collected. I'll show you an example of this...

[Demonstrates memory example]

Let me use an analogy to help this stick. Think of a closure like a backpack. When you create a function, it packs a backpack with all the variables it needs from its surrounding scope. Even if you take that function far away from where it was created, it still has its backpack with all those variables inside.

To summarize the key points from this video:
1. Closures are created at function DEFINITION time, not execution time
2. They provide a way to create private variables in JavaScript
3. Be careful with closures in loops - use 'let' or IIFE
4. Closures keep references to outer scope, which affects garbage collection
5. The backpack analogy is a good mental model

In our next video, I'll show you practical use cases for closures including the module pattern and function factories.

Thank you for watching! If you found this helpful, please like and subscribe.
`;

// Test cases
const testCases = [
  {
    name: 'Short Video (45 minutes)',
    duration: 2700, // 45 minutes
    expectedMCQs: 10,
  },
  {
    name: 'Medium Video (1.5 hours)',
    duration: 5400, // 1.5 hours
    expectedMCQs: 15,
  },
  {
    name: 'Long Video (2.5 hours)',
    duration: 9000, // 2.5 hours
    expectedMCQs: 20,
  },
  {
    name: 'Very Long Video (4 hours)',
    duration: 14400, // 4 hours
    expectedMCQs: 25,
  },
  {
    name: 'No Duration (Default)',
    duration: null,
    expectedMCQs: 10,
  },
];

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validation functions
function validateQuestion(question, testName) {
  const issues = [];

  // Check if question text exists
  if (!question.question || question.question.trim().length === 0) {
    issues.push('Missing question text');
  }

  // Check options
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    issues.push('Must have exactly 4 options');
  }

  // Check answer index
  if (typeof question.answerIndex !== 'number' || question.answerIndex < 0 || question.answerIndex > 3) {
    issues.push('Answer index must be 0-3');
  }

  // Check explanation
  if (!question.explanation || question.explanation.trim().length === 0) {
    issues.push('Missing explanation');
  }

  // Check for forbidden patterns (metadata questions)
  const forbiddenPatterns = [
    /what is the (title|name) of (this|the) video/i,
    /how long is (this|the) video/i,
    /who (uploaded|created|made) (this|the) video/i,
    /when was (this|the) video (uploaded|published|posted)/i,
    /how many (views|likes|comments)/i,
    /what is the channel name/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(question.question)) {
      issues.push(`FORBIDDEN: Question appears to ask about metadata: "${question.question}"`);
    }
  }

  // Check for good patterns (content-based questions)
  const goodPatterns = [
    /according to (the|this) (speaker|instructor|video)/i,
    /in (the|this) (example|demonstration)/i,
    /what (analogy|comparison)/i,
    /what (warning|mistake|misconception)/i,
    /how did (the|this) (speaker|instructor)/i,
  ];

  const hasGoodPattern = goodPatterns.some(pattern => pattern.test(question.question));

  if (!hasGoodPattern) {
    issues.push('WARNING: Question may not reference video-specific content');
  }

  return issues;
}

async function runTest(testCase) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Test: ${testCase.name}`, 'cyan');
  log(`Duration: ${testCase.duration ? `${testCase.duration}s (${(testCase.duration / 3600).toFixed(2)}h)` : 'Not provided'}`, 'blue');
  log(`Expected MCQs: ${testCase.expectedMCQs}`, 'blue');
  log('='.repeat(60), 'cyan');

  try {
    const startTime = Date.now();
    const result = await generateQuiz(
      sampleTranscript,
      'Advanced JavaScript Closures Tutorial',
      testCase.duration
    );
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log(`\n✓ Generation completed in ${duration}s`, 'green');

    // Validate structure
    if (!result.questions || !Array.isArray(result.questions)) {
      log('✗ FAIL: Invalid quiz structure', 'red');
      return false;
    }

    const actualMCQs = result.questions.length;
    log(`\nActual MCQs generated: ${actualMCQs}`, 'blue');

    // Check MCQ count
    if (actualMCQs === testCase.expectedMCQs) {
      log('✓ PASS: MCQ count matches expectation', 'green');
    } else {
      log(`✗ FAIL: Expected ${testCase.expectedMCQs} MCQs, got ${actualMCQs}`, 'red');
      return false;
    }

    // Validate each question
    log('\nValidating questions...', 'yellow');
    let validQuestions = 0;
    let totalIssues = 0;

    result.questions.forEach((q, index) => {
      const issues = validateQuestion(q, testCase.name);
      
      if (issues.length === 0) {
        validQuestions++;
        log(`  Q${index + 1}: ✓ Valid`, 'green');
      } else {
        totalIssues += issues.length;
        log(`  Q${index + 1}: ⚠ Issues found:`, 'yellow');
        issues.forEach(issue => {
          if (issue.startsWith('FORBIDDEN')) {
            log(`    • ${issue}`, 'red');
          } else if (issue.startsWith('WARNING')) {
            log(`    • ${issue}`, 'yellow');
          } else {
            log(`    • ${issue}`, 'yellow');
          }
        });
      }
    });

    // Sample questions
    log('\nSample Questions:', 'cyan');
    result.questions.slice(0, 2).forEach((q, index) => {
      log(`\n  Q${index + 1}: ${q.question}`, 'blue');
      q.options.forEach((opt, i) => {
        const marker = i === q.answerIndex ? '✓' : ' ';
        log(`    ${marker} ${String.fromCharCode(65 + i)}. ${opt}`, i === q.answerIndex ? 'green' : 'reset');
      });
      log(`    Explanation: ${q.explanation}`, 'cyan');
    });

    // Summary
    log('\n' + '-'.repeat(60), 'cyan');
    log(`Valid Questions: ${validQuestions}/${actualMCQs}`, validQuestions === actualMCQs ? 'green' : 'yellow');
    log(`Total Issues: ${totalIssues}`, totalIssues === 0 ? 'green' : 'yellow');
    log(`Status: ${actualMCQs === testCase.expectedMCQs && totalIssues === 0 ? 'PASS ✓' : 'NEEDS REVIEW ⚠'}`, 
        actualMCQs === testCase.expectedMCQs && totalIssues === 0 ? 'green' : 'yellow');

    return true;
  } catch (error) {
    log(`\n✗ ERROR: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('QUIZ GENERATION SYSTEM - TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');

  if (!process.env.GEMINI_API_KEY) {
    log('\n✗ ERROR: GEMINI_API_KEY not found in environment', 'red');
    log('Please create a .env file with your API key', 'yellow');
    return;
  }

  const results = [];

  for (const testCase of testCases) {
    const passed = await runTest(testCase);
    results.push({ name: testCase.name, passed });
    
    // Wait between tests to avoid rate limiting
    if (testCase !== testCases[testCases.length - 1]) {
      log('\nWaiting 3 seconds before next test...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  results.forEach(result => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`${status}: ${result.name}`, color);
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  log('\n' + '-'.repeat(60), 'cyan');
  log(`Total: ${passedCount}/${totalCount} tests passed`, passedCount === totalCount ? 'green' : 'yellow');
  log('='.repeat(60), 'cyan');
}

// Run tests
runAllTests().catch(error => {
  log('\n✗ FATAL ERROR:', 'red');
  console.error(error);
  process.exit(1);
});
