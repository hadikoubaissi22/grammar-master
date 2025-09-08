// src/data/enhancedLessons.js
export const enhancedLessons = [
  {
    id: 1,
    title: "Nouns and Pronouns",
    description: "Learn about different types of nouns and how to use pronouns correctly",
    icon: "📚",
    questions: [
      {
        id: 1,
        text: "Which word is a noun in this sentence: 'The cat jumped over the fence.'?",
        options: ["The", "cat", "jumped", "over"],
        correctAnswer: 1,
        explanation: "'Cat' is a noun because it's a thing - an animal."
      },
      {
        id: 2,
        text: "What is the pronoun in this sentence: 'She went to the store.'?",
        options: ["went", "to", "She", "store"],
        correctAnswer: 2,
        explanation: "'She' is a pronoun that replaces a female noun (like a girl or woman)."
      },
      {
        id: 3,
        text: "Which of these is a proper noun?",
        options: ["city", "teacher", "London", "book"],
        correctAnswer: 2,
        explanation: "'London' is a proper noun because it's the specific name of a place."
      },
      {
        id: 4,
        text: "What type of noun is 'team'?",
        options: ["Proper noun", "Collective noun", "Abstract noun", "Common noun"],
        correctAnswer: 1,
        explanation: "'Team' is a collective noun because it refers to a group of people."
      },
      {
        id: 5,
        text: "Which sentence uses a pronoun correctly?",
        options: [
          "Me and him went to the park.",
          "Him and me went to the park.",
          "He and I went to the park.",
          "I and he went to the park."
        ],
        correctAnswer: 2,
        explanation: "'He and I went to the park' is correct because 'he' and 'I' are subject pronouns."
      }
    ]
  },
  {
    id: 2,
    title: "Verbs and Tenses",
    description: "Understand action words and how to use them in different time frames",
    icon: "🏃",
    questions: [
      {
        id: 1,
        text: "What is the verb in this sentence: 'The children play in the park.'?",
        options: ["The", "children", "play", "park"],
        correctAnswer: 2,
        explanation: "'Play' is the verb because it shows the action the children are doing."
      },
      {
        id: 2,
        text: "Which verb is in the past tense?",
        options: ["walk", "walks", "walked", "walking"],
        correctAnswer: 2,
        explanation: "'Walked' is in the past tense because it describes an action that already happened."
      },
      {
        id: 3,
        text: "Which sentence uses the future tense?",
        options: [
          "I am eating lunch.",
          "I was eating lunch.",
          "I will eat lunch.",
          "I eat lunch."
        ],
        correctAnswer: 2,
        explanation: "'I will eat lunch' uses the future tense because it describes an action that will happen later."
      },
      {
        id: 4,
        text: "What is the present participle of 'run'?",
        options: ["run", "ran", "runs", "running"],
        correctAnswer: 3,
        explanation: "'Running' is the present participle form of the verb 'run'."
      },
      {
        id: 5,
        text: "Which sentence contains a helping verb?",
        options: [
          "She sings beautifully.",
          "They are playing soccer.",
          "He wrote a letter.",
          "We eat dinner at 6 PM."
        ],
        correctAnswer: 1,
        explanation: "'Are playing' contains the helping verb 'are' which helps the main verb 'playing'."
      }
    ]
  },
  {
    id: 3,
    title: "Adjectives and Adverbs",
    description: "Discover describing words and how they make sentences more interesting",
    icon: "🎨",
    questions: [
      {
        id: 1,
        text: "Which word is an adjective in this sentence: 'The red ball bounced high.'?",
        options: ["The", "red", "ball", "high"],
        correctAnswer: 1,
        explanation: "'Red' is an adjective because it describes the noun 'ball'."
      },
      {
        id: 2,
        text: "Which word is an adverb in this sentence: 'She quickly finished her homework.'?",
        options: ["She", "quickly", "finished", "homework"],
        correctAnswer: 1,
        explanation: "'Quickly' is an adverb because it describes how she finished her homework."
      },
      {
        id: 3,
        text: "What question does the adverb answer in this sentence: 'They arrived early.'?",
        options: ["How?", "When?", "Where?", "Why?"],
        correctAnswer: 1,
        explanation: "'Early' tells when they arrived, so it answers the question 'When?'"
      },
      {
        id: 4,
        text: "Which is the comparative form of 'happy'?",
        options: ["happily", "happier", "happiest", "happy"],
        correctAnswer: 1,
        explanation: "'Happier' is the comparative form used when comparing two things."
      },
      {
        id: 5,
        text: "Identify the adjective in this sentence: 'The mysterious package arrived yesterday.'",
        options: ["The", "mysterious", "package", "yesterday"],
        correctAnswer: 1,
        explanation: "'Mysterious' is the adjective because it describes the noun 'package'."
      }
    ]
  },
  {
    id: 4,
    title: "Sentence Structure",
    description: "Learn how to build proper sentences with correct grammar",
    icon: "🔨",
    questions: [
      {
        id: 1,
        text: "Which of these is a complete sentence?",
        options: [
          "Running in the park.",
          "The dog barked loudly.",
          "After the rain stopped.",
          "The big, red apple."
        ],
        correctAnswer: 1,
        explanation: "'The dog barked loudly' is a complete sentence with a subject (dog) and predicate (barked loudly)."
      },
      {
        id: 2,
        text: "What is the subject of this sentence: 'My little sister plays the piano.'?",
        options: ["My", "little sister", "plays", "the piano"],
        correctAnswer: 1,
        explanation: "'Little sister' is the subject because she is the one performing the action."
      },
      {
        id: 3,
        text: "Which sentence is a compound sentence?",
        options: [
          "She likes apples and oranges.",
          "I wanted to go, but it was raining.",
          "The tall, dark stranger entered the room.",
          "Running quickly, he caught the bus."
        ],
        correctAnswer: 1,
        explanation: "This is a compound sentence because it contains two independent clauses joined by 'but'."
      },
      {
        id: 4,
        text: "What type of sentence is this: 'Wow, that was amazing!'",
        options: ["Declarative", "Interrogative", "Exclamatory", "Imperative"],
        correctAnswer: 2,
        explanation: "This is an exclamatory sentence because it shows strong emotion and ends with an exclamation mark."
      },
      {
        id: 5,
        text: "Which sentence has correct punctuation?",
        options: [
          "I like pizza, pasta, and salad.",
          "I like pizza, pasta and salad.",
          "I like pizza pasta and salad.",
          "I like pizza pasta, and salad."
        ],
        correctAnswer: 0,
        explanation: "This sentence correctly uses the Oxford comma before 'and' in a list."
      }
    ]
  }
];