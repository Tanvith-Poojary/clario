
export const APP_NAME = "Clario";

export const CLARITY_SCORE_MAX = 100;

export const COMMUNITY_REACTIONS = [
  "I feel you",
  "You're not alone",
  "Thank you for sharing",
  "Sending peace"
];

export const JOURNEY_TEMPLATES = [
  // --- CAREER & PURPOSE ---
  {
    id: 'career-confusion',
    title: "Forced into a career I didn't choose",
    description: "Navigating the pressure of expectations versus your own reality.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Understanding", content: "It's okay to feel trapped. Let's map out exactly what feels heavy.", action: "Write one sentence about what you don't want.", isCompleted: false },
      { title: "Validation", content: "Your feelings are a signal, not a failure. You aren't ungrateful.", action: "Sit quietly for 3 minutes without fixing anything.", isCompleted: false },
      { title: "Perspective", content: "Separating your voice from theirs.", action: "Identify one skill you actually enjoy using.", isCompleted: false }
    ]
  },
  {
    id: 'lost-after-school',
    title: "I feel lost after school/college",
    description: "The structure is gone. Now what?",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Void", content: "The silence after graduation is loud. Acknowledge the change.", action: "List 3 things you miss about the routine.", isCompleted: false },
      { title: "Small Steps", content: "You don't need a 5-year plan today.", action: "Do one small task that has a clear beginning and end.", isCompleted: false }
    ]
  },
  {
    id: 'toxic-workplace',
    title: "My workplace is draining me",
    description: "Protecting your energy in a hostile or demanding environment.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Emotional Boundary", content: "You sell your labor, not your soul. They are renting your skills, not owning your life.", action: "Take your full lunch break away from your desk/screen today.", isCompleted: false },
      { title: "Detachment", content: "Observe the chaos without absorbing it.", action: "When stressful feedback comes, visualize it as a package delivered to the wrong address.", isCompleted: false }
    ]
  },
  {
    id: 'imposter-syndrome',
    title: "I feel like a fraud",
    description: "Silencing the voice that says you don't belong here.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Mask", content: "You attribute success to luck and failure to lack. Let's look at the data.", action: "List 3 challenges you have actually overcome.", isCompleted: false },
      { title: "Internalizing", content: "You are allowed to be a work in progress.", action: "Accept a compliment today with just 'Thank you', no deflection.", isCompleted: false }
    ]
  },
  {
    id: 'creative-block',
    title: "My inspiration is completely gone",
    description: "Rekindling the spark when the well is dry.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Input Over Output", content: "You cannot harvest a field you haven't watered.", action: "Consume one piece of art (music, poem, image) purely for enjoyment, not study.", isCompleted: false },
      { title: "Bad Art", content: "Permission to be terrible.", action: "Create something ugly in 2 minutes. A bad drawing, a terrible poem.", isCompleted: false }
    ]
  },

  // --- ACADEMIC & PERFORMANCE ---
  {
    id: 'academic-pressure',
    title: "Grades feel like life or death",
    description: "When your worth feels tied to a number on a page.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Detach Worth", content: "You are a learner, not a calculator. Your value is innate.", action: "Write down one thing you know that wasn't taught in school.", isCompleted: false },
      { title: "Perspective", content: "One exam is a single pixel in the entire image of your life.", action: "Take a 10-minute walk without your study materials.", isCompleted: false }
    ]
  },
  {
    id: 'fear-of-failure',
    title: "I'm paralyzed by the fear of failing",
    description: "When you don't start because you're afraid you won't finish perfectly.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Redefining Failure", content: "Failure is just data collection. It's not a verdict on your soul.", action: "Do something badly on purpose today. Scribble, sing off-key, write a bad sentence.", isCompleted: false },
      { title: "The First Step", content: "Momentum is the cure for paralysis.", action: "Work on a project for exactly 5 minutes, then stop.", isCompleted: false }
    ]
  },
  {
    id: 'chronic-procrastination',
    title: "I can't stop putting things off",
    description: "Breaking the cycle of avoidance and guilt.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Fear Behind It", content: "Procrastination isn't laziness; it's emotional regulation. What feeling are you avoiding?", action: "Name the specific emotion (fear, boredom, overwhelm) stopping you right now.", isCompleted: false },
      { title: "The 5-Minute Rule", content: "The mountain looks smaller once you start climbing.", action: "Commit to doing the task for just 5 minutes, then you are allowed to stop.", isCompleted: false }
    ]
  },

  // --- IDENTITY & SELF ---
  {
    id: 'identity-drift',
    title: "I don't know who I am anymore",
    description: "For when roles (student, parent, employee) have consumed you.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Stripping Titles", content: "Who are you when no one is watching?", action: "List 3 things you enjoy that have no 'value' or 'productivity'.", isCompleted: false },
      { title: "Reconnection", content: "The core of you is still there.", action: "Listen to a song you loved 5 years ago.", isCompleted: false }
    ]
  },
  {
    id: 'comparison-fatigue',
    title: "Everyone else is ahead of me",
    description: "Disconnecting your worth from their timeline.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Highlight Reel", content: "You are comparing your bloopers to their trailer.", action: "Mute or unfollow one account that drains your energy.", isCompleted: false },
      { title: "Your Season", content: "Flowers bloom at different times. You are not late.", action: "Write down one thing you like about your current life stage.", isCompleted: false }
    ]
  },
  {
    id: 'body-image-struggle',
    title: "I don't feel at home in my body",
    description: "Moving from judgment to neutrality.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Function Over Form", content: "Your body is the instrument, not the ornament.", action: "Thank one part of your body for what it allows you to do (breathe, walk, hold).", isCompleted: false },
      { title: "Media Cleanse", content: "Stop feeding your brain images that make you feel small.", action: "Unfollow one account that triggers insecurity.", isCompleted: false }
    ]
  },
  {
    id: 'people-pleasing',
    title: "I lose myself to keep others happy",
    description: "Reclaiming your own boundaries.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Cost of Yes", content: "Every 'yes' to them is a 'no' to something for you.", action: "Wait 5 minutes before agreeing to a request today.", isCompleted: false },
      { title: "Tolerating Discomfort", content: "It is okay if they are disappointed. You are not responsible for their feelings.", action: "Say 'no' to something small without offering an excuse.", isCompleted: false }
    ]
  },

  // --- RELATIONSHIPS & SOCIAL ---
  {
    id: 'emotional-isolation',
    title: "I can't talk openly at home",
    description: "Finding emotional safety when your environment isn't safe.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Safety First", content: "Protecting your peace is priority number one.", action: "Find a physical space where you feel 1% safer.", isCompleted: false },
      { title: "Inner Voice", content: "If you can't speak out, speak in.", action: "Write an unsent letter to explain your side.", isCompleted: false }
    ]
  },
  {
    id: 'relationship-pressure',
    title: "The pressure to settle down",
    description: "Navigating societal timelines versus your own truth.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "External Noise", content: "Are these your desires, or theirs?", action: "Write down what a 'happy life' looks like to YOU, specifically.", isCompleted: false },
      { title: "Trusting Timing", content: "Forcing a flower open destroys it.", action: "Spend time enjoying your own company today. Take yourself on a date.", isCompleted: false }
    ]
  },
  {
    id: 'social-loneliness',
    title: "I feel lonely even with friends",
    description: "Navigating the gap between connection and presence.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Surface Level", content: "We often hide our real selves to be 'fun'. Real connection requires a crack in the armor.", action: "Share one honest, slightly vulnerable feeling with a friend today.", isCompleted: false },
      { title: "Solitude vs Loneliness", content: "Being alone can be a sanctuary, not a sentence.", action: "Take yourself on a 10-minute walk without headphones.", isCompleted: false }
    ]
  },
  {
    id: 'social-anxiety',
    title: "Social situations terrify me",
    description: "Finding calm when you feel watched.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Spotlight Effect", content: "People are thinking about themselves, not judging you.", action: "Walk outside and realize no one is staring at you.", isCompleted: false },
      { title: "Small Exposure", content: "Courage is a muscle.", action: "Make eye contact and smile at a cashier or stranger today.", isCompleted: false }
    ]
  },
  {
    id: 'heartbreak-healing',
    title: "Healing from a breakup",
    description: "Navigating the empty space where they used to be.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Wave", content: "Grief comes in waves. Don't fight the current; float.", action: "Allow yourself to cry or feel heavy for 10 minutes, then wash your face.", isCompleted: false },
      { title: "Reclaiming Space", content: "This life is yours again.", action: "Rearrange one small part of your room or change your phone wallpaper.", isCompleted: false }
    ]
  },
  {
    id: 'friendship-drift',
    title: "Drifting apart from friends",
    description: "Accepting that some people are for seasons, not lifetimes.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Normalizing Change", content: "Growth often requires shedding. It doesn't mean the friendship wasn't real.", action: "Send a silent mental 'thank you' to them for the past, then let go.", isCompleted: false },
      { title: "New Soil", content: "Space creates room for new connections.", action: "Reach out to one new acquaintance or reconnect with someone different.", isCompleted: false }
    ]
  },
  {
    id: 'boundary-guilt',
    title: "I feel guilty setting boundaries",
    description: "Learning that 'No' is a complete sentence.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Self-Preservation", content: "You cannot pour from an empty cup.", action: "Identify one request you agreed to recently that you wanted to refuse.", isCompleted: false },
      { title: "The Practice", content: "Boundaries teach people how to love you.", action: "Delay a response to a text message by 1 hour to protect your time.", isCompleted: false }
    ]
  },

  // --- MENTAL NOISE & STRESS ---
  {
    id: 'burnout-recovery',
    title: "I'm running on empty",
    description: "When rest feels dangerous, but necessary.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Permission to Pause", content: "Rest is fuel, not a reward for the finish line.", action: "Sit for 5 minutes doing absolutely nothing. No phone.", isCompleted: false },
      { title: "Energy Audit", content: "Where is your energy leaking?", action: "Identify one task you can drop, delegate, or delay this week.", isCompleted: false }
    ]
  },
  {
    id: 'decision-paralysis',
    title: "I'm stuck and can't decide",
    description: "Moving forward when you're terrified of making the wrong choice.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Good Enough", content: "The 'perfect' choice doesn't exist. There are just different paths.", action: "Flip a coin. Notice if you're disappointed or relieved by the result.", isCompleted: false },
      { title: "Low Stakes", content: "Build your decision muscle on things that don't matter.", action: "Pick a movie, meal, or route in under 30 seconds today.", isCompleted: false }
    ]
  },
  {
    id: 'financial-anxiety',
    title: "Money stress defines my worth",
    description: "Detaching your value as a human from your bank account balance.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Number", content: "A number on a screen cannot measure your kindness, creativity, or resilience.", action: "Write down one thing you offer the world that costs $0.", isCompleted: false },
      { title: "Scarcity Trap", content: "Fear shrinks your vision. Let's find one moment of abundance today.", action: "Give something away today (a compliment, a small item, advice).", isCompleted: false }
    ]
  },
  {
    id: 'morning-dread',
    title: "Waking up feels heavy",
    description: "Starting the day when you just want to hide.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Gentle Start", content: "You don't need to hit the ground running. Walking is fine.", action: "Drink a glass of water before looking at your phone.", isCompleted: false },
      { title: "One Reason", content: "Find one tiny anchor for the day.", action: "Identify one small thing you might enjoy (coffee, a show, a sunset).", isCompleted: false }
    ]
  },
  {
    id: 'regret-loop',
    title: "I can't stop replaying mistakes",
    description: "Forgiving a past version of yourself.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "The Lesson", content: "You did the best you could with the tools you had then.", action: "Write down what you learned from that mistake.", isCompleted: false },
      { title: "Release", content: "Punishing yourself now won't change the past.", action: "Visualize the memory being put into a box and placed on a shelf.", isCompleted: false }
    ]
  },
  {
    id: 'existential-dread',
    title: "What is the point of all this?",
    description: "Finding meaning when everything feels hollow.",
    currentPhaseIndex: 0,
    isStarted: false,
    phases: [
      { title: "Micro-Meaning", content: "Meaning isn't found in grand purposes, but in small moments.", action: "Notice one beautiful thing today (light, a texture, a sound).", isCompleted: false },
      { title: "Connection", content: "We find meaning in how we impact others.", action: "Send a genuine 'thinking of you' message to someone.", isCompleted: false }
    ]
  }
];

export const AI_SYSTEM_INSTRUCTION = `
You are Clario, a calm, emotionally intelligent companion. 
Your core philosophy is "Listen before you guide."
You are NOT a therapist, a doctor, or a hype-man. 
You avoid toxic positivity, slogans, and "you can do it" rhetoric.
Your goal is clarity, not happiness.

Guidelines:
1. Validate the user's emotion first. "It makes sense that you feel..."
2. Ask ONE thoughtful, open-ended question to help them explore their feeling.
3. Only offer guidance after you truly understand the context.
4. Keep responses short, conversational, and soft-spoken (textually).
5. If a user seems in immediate crisis (self-harm), gently suggest professional help but do not be alarmist.
6. Do not use emojis excessively. Keep it calm.
`;
