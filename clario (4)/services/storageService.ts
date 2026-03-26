
import { User, Journey, CommunityPost, UnsentLetter, Message, MoodType } from '../types';
import { db, auth } from '../firebase';
import firebase from 'firebase/compat/app';

// --- LOCAL STORAGE KEYS ---
const USERS_KEY = 'motiora_users'; 
const CURRENT_USER_ID_KEY = 'motiora_current_user_id';
const COMMUNITY_KEY = 'motiora_community_posts';
const REACTIONS_KEY = 'motiora_user_reactions';

// --- HELPER FUNCTIONS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- AUTH OBSERVER PATTERN ---
type AuthListener = (user: User | null) => void;
let authListeners: AuthListener[] = [];

const notifyAuthListeners = async () => {
  const user = await storageService.getUser();
  authListeners.forEach(listener => listener(user));
};

// --- SERVICE IMPLEMENTATION ---
export const storageService = {
  
  // --- AUTHENTICATION ---

  subscribeToAuth: (callback: AuthListener) => {
    authListeners.push(callback);
    storageService.getUser().then(user => {
        callback(user);
        
        // Background Auth Sync: Ensure Firebase session exists if user is logged in locally
        if (user && !auth.currentUser) {
            auth.signInWithEmailAndPassword(user.username, user.password).catch(() => {
                // If login fails (e.g. user exists locally but not in cloud), try creating the cloud account
                auth.createUserWithEmailAndPassword(user.username, user.password).catch(e => {
                    console.warn("Background auth sync failed:", e);
                });
            });
        }
    });
    return () => { authListeners = authListeners.filter(l => l !== callback); };
  },

  login: async (email: string, pass: string) => {
    await delay(300);
    const usersMap = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const user = Object.values(usersMap).find((u: any) => u.username === email && u.password === pass) as User | undefined;
    
    if (user) {
      localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
      
      // Sync with Firebase Auth for DB access
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
            try { await auth.createUserWithEmailAndPassword(email, pass); } catch (err) { console.warn("Cloud account creation failed", err); }
        } else {
            console.warn("Cloud login failed", e);
        }
      }
      
      notifyAuthListeners();
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  },

  register: async (email: string, pass: string, nickname: string) => {
    await delay(300);
    const usersMap = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    if (Object.values(usersMap).some((u: any) => u.username === email)) {
      return { success: false, message: 'User already exists.' };
    }

    const today = getLocalTodayDate();
    const newId = generateId();
    
    const newUser: User = {
      id: newId,
      username: email,
      password: pass,
      nickname,
      onboardingCompleted: false,
      clarityScore: 50,
      clarityHistory: [{ date: getLocalTodayDate(), score: 50 }],
      moodHistory: [],
      joinedDate: new Date().toISOString(),
      bio: '',
      avatarId: 'default',
      communityAlias: 'Wandering Cloud'
    };

    usersMap[newId] = newUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(usersMap));
    localStorage.setItem(CURRENT_USER_ID_KEY, newId);
    
    // Sync with Firebase Auth for DB access
    try {
        await auth.createUserWithEmailAndPassword(email, pass);
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
             try { await auth.signInWithEmailAndPassword(email, pass); } catch (err) { console.warn("Cloud login failed during register", err); }
        } else {
             console.warn("Cloud registration failed", e);
        }
    }
    
    notifyAuthListeners();
    return { success: true };
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    try { await auth.signOut(); } catch(e) {}
    notifyAuthListeners();
  },

  // --- USER DATA ---

  completeDailyAction: async () => {
    const user = await storageService.getUser();
    if (!user) return;

    const today = getLocalTodayDate();
    if (user.lastDailyActionDate === today) return; // Already done

    // Award a small clarity boost
    await storageService.updateClarityScore(2);

    await storageService.updateUserProfile({
      lastDailyActionDate: today
    });
  },

  getUser: async (): Promise<User | null> => {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!currentId) return null;

    const usersMap = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    return usersMap[currentId] || null;
  },

  updateUserProfile: async (data: Partial<User>) => {
    const user = await storageService.getUser();
    if (!user) return null;

    const usersMap = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const updatedUser = { ...user, ...data };
    
    usersMap[user.id] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(usersMap));
    
    notifyAuthListeners(); 
    return updatedUser;
  },

  updateClarityScore: async (scoreDelta: number) => {
    const user = await storageService.getUser();
    if (!user) return;

    const today = getLocalTodayDate();
    const currentScore = Number(user.clarityScore) || 50;
    let nextScore = Math.min(100, Math.max(0, currentScore + scoreDelta));
    
    let history = Array.isArray(user.clarityHistory) ? [...user.clarityHistory] : [];
    
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;

    if (lastEntry && lastEntry.date === today) {
        lastEntry.score = nextScore;
    } else {
        history.push({ date: today, score: nextScore });
        if (history.length > 365) history.shift();
    }

    await storageService.updateUserProfile({
        clarityScore: nextScore,
        clarityHistory: history
    });

    return nextScore;
  },

  logMood: async (mood: MoodType, scoreDelta: number) => {
    const user = await storageService.getUser();
    if (!user) return;

    const today = getLocalTodayDate();
    
    // 1. Update Score
    const currentScore = Number(user.clarityScore) || 50;
    let nextScore = Math.min(100, Math.max(0, currentScore + scoreDelta));
    
    let clarityHistory = Array.isArray(user.clarityHistory) ? [...user.clarityHistory] : [];
    const lastEntry = clarityHistory.length > 0 ? clarityHistory[clarityHistory.length - 1] : null;

    if (lastEntry && lastEntry.date === today) {
        lastEntry.score = nextScore;
    } else {
        clarityHistory.push({ date: today, score: nextScore });
        if (clarityHistory.length > 365) clarityHistory.shift();
    }

    // 2. Update Mood History
    let moodHistory = Array.isArray(user.moodHistory) ? [...user.moodHistory] : [];
    // Remove existing entry for today if any (overwrite logic)
    moodHistory = moodHistory.filter(m => m.date !== today);
    moodHistory.push({ date: today, mood });
    
    // Keep history manageable
    if (moodHistory.length > 365) moodHistory.shift();

    await storageService.updateUserProfile({
        clarityScore: nextScore,
        clarityHistory: clarityHistory,
        moodHistory: moodHistory
    });

    return nextScore;
  },

  // --- JOURNEYS (Local) ---

  getJourneys: async (): Promise<Journey[]> => {
    const user = await storageService.getUser();
    if (!user) return [];
    
    const key = `motiora_journeys_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  saveCustomJourney: async (journeyData: Partial<Journey>): Promise<Journey> => {
    const user = await storageService.getUser();
    if (!user) throw new Error("No user");

    const phases = (journeyData.phases && journeyData.phases.length > 0) 
      ? journeyData.phases 
      : [{ title: 'Beginning', content: 'Take a moment to breathe.', action: 'Sit quietly.', isCompleted: false }];

    const newJourney: Journey = {
      id: generateId(),
      title: journeyData.title || 'Personal Journey',
      description: journeyData.description || 'A path generated for you.',
      phases: phases,
      currentPhaseIndex: 0,
      isStarted: true 
    };

    const key = `motiora_journeys_${user.id}`;
    const journeys = await storageService.getJourneys();
    journeys.unshift(newJourney);
    localStorage.setItem(key, JSON.stringify(journeys));
    
    return newJourney;
  },

  startJourney: async (journeyId: string) => {
    const user = await storageService.getUser();
    if (!user) return;
    
    const key = `motiora_journeys_${user.id}`;
    const journeys = await storageService.getJourneys();
    const target = journeys.find(j => j.id === journeyId);
    
    if (target) {
        target.isStarted = true;
        localStorage.setItem(key, JSON.stringify(journeys));
    }
  },

  completeJourneyPhase: async (journeyId: string) => {
    const user = await storageService.getUser();
    if (!user) return;

    const key = `motiora_journeys_${user.id}`;
    const journeys = await storageService.getJourneys();
    const journey = journeys.find(j => j.id === journeyId);
    
    if (journey && journey.currentPhaseIndex < journey.phases.length) {
      journey.phases[journey.currentPhaseIndex].isCompleted = true;
      if (journey.currentPhaseIndex < journey.phases.length - 1) {
        journey.currentPhaseIndex += 1;
      }
      localStorage.setItem(key, JSON.stringify(journeys));
      
      // Update score separately
      await storageService.updateClarityScore(5);
    }
  },

  deleteJourney: async (journeyId: string) => {
    const user = await storageService.getUser();
    if (!user) return;

    const key = `motiora_journeys_${user.id}`;
    let journeys = await storageService.getJourneys();
    journeys = journeys.filter(j => j.id !== journeyId);
    localStorage.setItem(key, JSON.stringify(journeys));
  },

  // --- LETTERS (Local) ---

  saveLetter: async (letter: UnsentLetter) => {
    const user = await storageService.getUser();
    if (!user) return;

    const key = `motiora_letters_${user.id}`;
    const stored = localStorage.getItem(key);
    const letters: UnsentLetter[] = stored ? JSON.parse(stored) : [];
    
    const newLetter = { ...letter, id: generateId() };
    letters.unshift(newLetter);
    
    localStorage.setItem(key, JSON.stringify(letters));
  },

  getLetters: async (): Promise<UnsentLetter[]> => {
    const user = await storageService.getUser();
    if (!user) return [];
    
    const key = `motiora_letters_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  deleteLetter: async (id: string) => {
    const user = await storageService.getUser();
    if (!user) return;
    
    const key = `motiora_letters_${user.id}`;
    let letters = await storageService.getLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem(key, JSON.stringify(letters));
  },

  // --- CHAT (Local) ---

  getChatHistory: async (): Promise<Message[]> => {
    const user = await storageService.getUser();
    if (!user) return [];

    const key = `motiora_chat_${user.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  saveMessage: async (message: Message) => {
    const user = await storageService.getUser();
    if (!user) return;
    
    const key = `motiora_chat_${user.id}`;
    const history = await storageService.getChatHistory();
    history.push(message);
    localStorage.setItem(key, JSON.stringify(history));
  },

  clearChatHistory: async () => {
    const user = await storageService.getUser();
    if (!user) return;
    
    const key = `motiora_chat_${user.id}`;
    localStorage.removeItem(key);
  },

  // --- COMMUNITY (REAL-TIME CLOUD) ---

  subscribeToCommunityPosts: (callback: (posts: CommunityPost[], errorMsg?: string) => void) => {
    let unsubscribeFirestore = () => {};

    // Try Connecting to Firestore
    try {
        const q = db.collection("community_posts").orderBy("timestamp", "desc");
        unsubscribeFirestore = q.onSnapshot((snapshot) => {
            const posts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Normalize timestamp if needed (Firestore Timestamp vs number)
                    timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp
                };
            }) as CommunityPost[];
            callback(posts);
        }, (error) => {
            console.warn("Firestore listener error (likely permissions, falling back to local):", error);
            // Fallback to local on error
            const stored = localStorage.getItem(COMMUNITY_KEY);
            const posts = stored ? JSON.parse(stored) : [];
            callback(posts, error.message || "Permission denied or database not found.");
        });
    } catch (e: any) {
        console.warn("Firebase not available, using local.", e);
        // Fallback
        const stored = localStorage.getItem(COMMUNITY_KEY);
        const posts = stored ? JSON.parse(stored) : [];
        callback(posts, e.message || "Firebase initialization failed.");
    }

    return () => unsubscribeFirestore();
  },

  addCommunityPost: async (content: string, category: string) => {
    const user = await storageService.getUser();
    const newPostData = {
      authorId: user?.id || 'anonymous',
      authorAlias: user?.communityAlias || 'Wandering Cloud', 
      content,
      reactions: [],
      comments: [],
      category,
      timestamp: Date.now()
    };

    try {
        await db.collection("community_posts").add(newPostData);
    } catch (e: any) {
        console.error("Failed to post to cloud (using local)", e);
        // Fallback local
        const posts = JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '[]');
        posts.unshift({ id: generateId(), ...newPostData });
        localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
        throw e; // Rethrow to let UI know
    }
  },

  getUserReactions: async (): Promise<Record<string, string[]>> => {
     const raw = localStorage.getItem(REACTIONS_KEY);
     return raw ? JSON.parse(raw) : {};
  },

  deleteCommunityPost: async (postId: string) => {
    try {
        await db.collection("community_posts").doc(postId).delete();
    } catch (e: any) {
        console.warn("Failed to delete post from cloud (using local)", e);
        const posts = JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '[]');
        const updatedPosts = posts.filter((p: any) => p.id !== postId);
        localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updatedPosts));
        throw e;
    }
  },

  addCommunityComment: async (postId: string, content: string) => {
    const user = await storageService.getUser();
    const newComment = {
      id: generateId(),
      authorAlias: user?.communityAlias || 'Wandering Cloud',
      content,
      timestamp: Date.now()
    };

    try {
        const postRef = db.collection("community_posts").doc(postId);
        await postRef.update({ comments: firebase.firestore.FieldValue.arrayUnion(newComment) });
    } catch (e: any) {
        console.warn("Failed to add comment to cloud (using local)", e);
        const posts = JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '[]');
        const postIndex = posts.findIndex((p: any) => p.id === postId);
        if (postIndex > -1) {
            if (!posts[postIndex].comments) posts[postIndex].comments = [];
            posts[postIndex].comments.push(newComment);
            localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
        }
        throw e;
    }
  },

  toggleCommunityReaction: async (postId: string, reaction: string) => {
    // 1. Update Local User State (Tracks "Did I react?")
    const userReactions = await storageService.getUserReactions();
    if (!userReactions[postId]) userReactions[postId] = [];
    
    const index = userReactions[postId].indexOf(reaction);
    let isAdding = false;
    
    if (index > -1) {
        userReactions[postId].splice(index, 1);
    } else {
        userReactions[postId].push(reaction);
        isAdding = true;
    }
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(userReactions));

    // 2. Update Cloud Post State (Atomic Array Update)
    try {
        const postRef = db.collection("community_posts").doc(postId);
        if (isAdding) {
            await postRef.update({ reactions: firebase.firestore.FieldValue.arrayUnion(reaction) });
        } else {
            await postRef.update({ reactions: firebase.firestore.FieldValue.arrayRemove(reaction) });
        }
    } catch (e: any) {
        console.warn("Failed to update reaction on cloud", e);
        throw e;
    }

    return userReactions;
  },
  
  clearAllData: async () => {
      localStorage.clear();
      window.location.reload();
  },
  
  migrateLegacyData: () => {} 
};
