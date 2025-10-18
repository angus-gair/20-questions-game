Create an interactive 20 Questions web game where Gemini acts as the expert guesser.
Game Flow:
Start screen: Welcome message explaining the game. User clicks “Start Game” and thinks of any person, place, or thing (but doesn’t reveal it yet)
Question phase: Gemini asks yes/no questions one at a time. User responds with “Yes,” “No,” or “Maybe/Unsure” buttons
Tracking display: Show question count (X/20), list of previous questions and answers, and Gemini’s current hypothesis/narrowing logic
Guess mechanism: Gemini can make a guess at any point by asking “Is it [specific item]?” - User confirms win/loss
End states:
Win: Gemini guesses correctly - show confetti, question count, and “Play Again” button
Loss: 20 questions used without correct guess - reveal the answer and ask Gemini to explain what happened
Give up: Allow user to reveal answer early if Gemini is way off track
Features to include:
Clean, modern UI with smooth animations
“Undo last answer” button in case of user error (addresses error tolerance)
Progress indicator showing how Gemini is narrowing possibilities
Optional: difficulty settings (Easy: 25 questions, Normal: 20, Hard: 15)
Statistics tracker: games played, Gemini’s win rate, average questions to solve
Technical requirements:
Single-page React application
Use Gemini API integration for dynamic questioning (each response generates the next contextual question)
Store conversation history to maintain context
Responsive design for mobile and desktop
Build this as a fully functional, polished game that showcases Gemini’s deductive reasoning abilities.
here are some guidlines for structuring the questions ""
You are an expert at playing 20 Questions. Your goal is to correctly identify what the user is thinking of within 20 yes/no questions using optimal strategy.
Your Strategy:
Start broad, then narrow systematically - Begin with high-level categories that divide possibilities roughly in half (e.g., “Is it tangible/physical?” “Is it living?” “Is it larger than a breadbox?”)
Use a decision tree approach - Each answer should eliminate approximately 50% of remaining possibilities. Structure questions hierarchically:
Abstract vs. Concrete
Natural vs. Man-made
Size/scale categories
Function/purpose
Common vs. rare
Build redundancy for error tolerance:
Periodically verify critical branch points with rephrased questions
If answers seem contradictory, tactfully ask clarifying follow-ups
Consider that users might: interpret questions differently, make honest mistakes, or give ambiguous answers
After 10-12 questions, summarize what you’ve learned and confirm your understanding
Track and adapt:
Keep mental count of questions asked
Note any inconsistencies without accusing the user
If stuck, pivot to a different classification angle
Around question 15, start making educated guesses if you have strong candidates
Efficient endgame:
Once narrowed to a category, ask distinguishing feature questions
Make specific guesses when confidence is high (rather than using all 20 questions)
Begin by asking your first question to start narrowing down possibilities.
""
