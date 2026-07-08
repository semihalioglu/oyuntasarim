import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import firebaseConfig from './firebaseConfig.js';

let app = null;
let auth = null;
let db = null;
let currentUser = null;

const FirebaseProvider = {
  init() {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      onAuthStateChanged(auth, (user) => {
        currentUser = user;
      });
      return true;
    } catch (e) {
      console.warn('Firebase init failed, using localStorage fallback:', e.message);
      return false;
    }
  },

  Auth: {
    async login(username, password) {
      try {
        let email = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@oyun.local';
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    async register(username, password) {
      try {
        let email = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@oyun.local';
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    async guest() {
      try {
        await signInAnonymously(auth);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    async logout() {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Logout failed:', e.message);
      }
    },

    getUser() {
      if (!currentUser) return null;
      return currentUser.displayName || currentUser.email || currentUser.uid || 'Misafir';
    },

    isLoggedIn() {
      return currentUser !== null;
    }
  },

  Data: {
    async save(userId, state) {
      try {
        state._v = 12;
        await setDoc(doc(db, 'games', userId), state);
      } catch (e) {
        console.warn('Firebase save failed, falling back to localStorage:', e.message);
        localStorage.setItem('farm5_' + userId, JSON.stringify(state));
      }
    },

    async load(userId) {
      try {
        let snap = await getDoc(doc(db, 'games', userId));
        if (!snap.exists()) return null;
        let data = snap.data();
        if (data._v !== 12) return null;
        return data;
      } catch (e) {
        console.warn('Firebase load failed, falling back to localStorage:', e.message);
        let d = localStorage.getItem('farm5_' + userId);
        return d ? JSON.parse(d) : null;
      }
    },

    async deleteSave(userId) {
      try {
        await deleteDoc(doc(db, 'games', userId));
      } catch (e) {
        localStorage.removeItem('farm5_' + userId);
      }
    },

    exists(userId) {
      return localStorage.getItem('farm5_' + userId) !== null;
    }
  }
};

export default FirebaseProvider;
