# Manual Test Protocol for 20 Questions Game

## Test Date: October 19, 2025
## URL: https://20.ajinsights.com.au

---

## Test Objective
Verify that the game can be completed without errors for the following items:
1. **Apple**
2. **Truck**
3. **Cow**

---

## Test Instructions

### Before Testing
1. Open https://20.ajinsights.com.au in a web browser
2. Open browser DevTools (F12) and go to Console tab to watch for errors
3. Keep Network tab open to monitor API calls

### For Each Test Item

1. **Start the Game**
   - Click difficulty level (Normal = 20 questions)
   - Think of the test item (don't tell the AI!)

2. **Answer Questions**
   - Answer each question honestly based on the item
   - Watch for:
     - ❌ API errors in console
     - ❌ UI freezing or not loading next question
     - ❌ Questions not making sense
     - ✅ Logical question progression

3. **Complete the Game**
   - Continue until:
     - AI guesses correctly (you click YES)
     - AI runs out of questions (game ends)
     - OR an error occurs (note it!)

4. **Record Results**
   - Questions asked: _____
   - Did AI guess correctly? YES / NO
   - Were there any errors? YES / NO
   - If errors, what happened? _______________

---

## Test Item #1: Apple

### Pre-planned Answers Guide

Use these to answer questions consistently:

| Question Type | Answer |
|--------------|--------|
| Living thing? | YES |
| Animal? | NO |
| Plant? | YES |
| Can you eat it? | YES |
| Fruit? | YES |
| Vegetable? | NO |
| Grows on tree? | YES |
| Has seeds? | YES |
| Red? | MAYBE (can be red, green, or yellow) |
| Round? | YES |
| Sweet? | YES |
| Tropical? | NO |
| Citrus? | NO |
| Is it a banana? | NO |
| Is it an apple? | YES ✅ |

### Test Results

- [ ] Game started successfully
- [ ] Questions progressed logically
- [ ] No API errors occurred
- [ ] Game completed successfully (won or lost)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Test Item #2: Truck

### Pre-planned Answers Guide

| Question Type | Answer |
|--------------|--------|
| Living thing? | NO |
| Man-made? | YES |
| Vehicle? | YES |
| Can it fly? | NO |
| Does it go in water? | NO |
| Does it go on road? | YES |
| Has wheels? | YES |
| Has engine? | YES |
| Bigger than a car? | YES |
| Is it a car? | NO |
| Is it a bus? | NO |
| Is it a truck? | YES ✅ |

### Test Results

- [ ] Game started successfully
- [ ] Questions progressed logically
- [ ] No API errors occurred
- [ ] Game completed successfully (won or lost)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Test Item #3: Cow

### Pre-planned Answers Guide

| Question Type | Answer |
|--------------|--------|
| Living thing? | YES |
| Animal? | YES |
| Plant? | NO |
| Mammal? | YES |
| Pet? | NO (typically) or MAYBE (can be) |
| Farm animal? | YES |
| Wild animal? | NO |
| Can you eat it? | YES (beef) |
| Gives milk? | YES |
| Has 4 legs? | YES |
| Has fur? | YES |
| Bigger than a dog? | YES |
| Is it a horse? | NO |
| Is it a pig? | NO |
| Is it a cow? | YES ✅ |

### Test Results

- [ ] Game started successfully
- [ ] Questions progressed logically
- [ ] No API errors occurred
- [ ] Game completed successfully (won or lost)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Overall Test Summary

### Success Criteria
- ✅ All 3 games can be completed without errors
- ✅ UI remains responsive throughout
- ✅ Questions progress logically
- ✅ No console errors or API failures
- ✅ Game can reach win or loss state properly

### Final Results

**Apple Test:** PASS / FAIL
**Truck Test:** PASS / FAIL
**Cow Test:** PASS / FAIL

**Overall Status:** ✅ PASS / ❌ FAIL

### Issues Found
```
________________________________________________________________
________________________________________________________________
________________________________________________________________
```

### Recommendations
```
________________________________________________________________
________________________________________________________________
________________________________________________________________
```

---

## Automated API Test

You can also test the API directly using curl:

```bash
# Test 1: Get first question
curl -k -X POST https://20.ajinsights.com.au/api/question \
  -H "Content-Type: application/json" \
  -d '{"history":[],"difficulty":"normal","maxQuestions":20}'

# Test 2: Answer and get next question
curl -k -X POST https://20.ajinsights.com.au/api/question \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {"question": "Is it a living thing?", "answer": "yes", "questionNumber": 1}
    ],
    "difficulty": "normal",
    "maxQuestions": 20
  }'
```

Expected: Should return JSON with `{"question": "...", "isGuess": false}`

---

## Browser Testing Checklist

- [ ] Test in Chrome/Edge
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test on mobile device
- [ ] Test with slow network (DevTools throttling)
- [ ] Test undo button functionality
- [ ] Test give up button functionality
- [ ] Test play again button

---

**Tester Name:** _______________
**Date Completed:** _______________
**Time Taken:** _______________
