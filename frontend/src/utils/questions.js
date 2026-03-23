export const adultQuestions = [
  'How often do you have trouble finishing tasks after the difficult parts are done?',
  'How often do you have difficulty organizing tasks or activities?',
  'How often do you forget appointments or commitments?',
  'How often do you avoid or delay tasks that require mental effort?',
  'How often do you lose things necessary for tasks like keys or phone?',
  'How often are you easily distracted by noise or activity around you?',
  'How often do you have trouble maintaining attention during long tasks?',
  'How often do you make careless mistakes in boring or repetitive tasks?',
  'How often do you struggle to follow detailed instructions?',
  'How often do you feel restless or fidgety when sitting for long periods?',
  'How often do you interrupt others while they are speaking?',
  'How often do you find it difficult to wait your turn in conversations?',
  'How often do you feel overwhelmed when handling multiple tasks?',
  'How often do you start tasks enthusiastically but struggle to finish them?',
  'How often do you have trouble managing time or meeting deadlines?',
  'How often do you feel the urge to move when expected to remain seated?',
  'How often do you forget daily responsibilities?',
  'How often do you switch tasks before completing the previous one?',
  'How often do you struggle to stay focused while reading?',
  'How often do you act impulsively without thinking about consequences?'
];

export const kidQuestions = [
  'How often does the child have trouble paying attention in class?',
  'How often does the child forget school materials or homework?',
  'How often does the child get distracted while doing tasks?',
  'How often does the child struggle to follow instructions?',
  'How often does the child leave tasks unfinished?',
  'How often does the child lose toys, books, or pencils?',
  'How often does the child seem not to listen when spoken to?',
  'How often does the child avoid homework that requires concentration?',
  'How often does the child fidget or move constantly while sitting?',
  'How often does the child talk excessively?',
  'How often does the child interrupt others?',
  'How often does the child struggle to wait for their turn?',
  'How often does the child run or climb excessively in inappropriate situations?',
  'How often does the child act without thinking?',
  'How often does the child struggle to stay focused during play or learning?'
];

export const scoringOptions = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Very Often', value: 3 }
];

/** Client-side prediction (matches backend logic) */
export function getPrediction(answers, ageGroup) {
  const totalScore = answers.reduce((sum, val) => sum + Number(val || 0), 0);
  let result;
  if (ageGroup === 'Adult') {
    if (totalScore <= 20) result = 'Unlikely ADHD';
    else if (totalScore <= 40) result = 'Possible ADHD traits';
    else result = 'High likelihood of ADHD';
  } else {
    if (totalScore <= 15) result = 'Unlikely ADHD';
    else if (totalScore <= 30) result = 'Possible ADHD traits';
    else result = 'High likelihood of ADHD';
  }
  return { totalScore, result };
}

