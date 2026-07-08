let _backend = 'local';
let _firebase = null;

const StorageManager = {

  async init(useFirebase) {
    if (useFirebase) {
      try {
        const { default: FB } = await import('./firebaseProvider.js');
        let ok = FB.init();
        if (ok) {
          _firebase = FB;
          _backend = 'firebase';
          return true;
        }
      } catch (e) {
        console.warn('Firebase load failed:', e.message);
      }
    }
    _backend = 'local';
    return false;
  },

  isFirebase() {
    return _backend === 'firebase';
  },

  Auth: {
    _getCurrentUser() {
      if (_backend === 'firebase' && _firebase) {
        return _firebase.Auth.getUser();
      }
      return sessionStorage.getItem('farm_user') || null;
    },

    _setCurrentUser(u) {
      if (_backend === 'firebase' && _firebase) return;
      sessionStorage.setItem('farm_user', u);
    },

    _clearCurrentUser() {
      if (_backend === 'firebase' && _firebase) return;
      sessionStorage.removeItem('farm_user');
    },

    _getUsers() {
      try { return JSON.parse(localStorage.getItem('farm_users') || '{}'); }
      catch (e) { return {}; }
    },

    _setUsers(u) {
      localStorage.setItem('farm_users', JSON.stringify(u));
    },

    async login(username, password) {
      if (_backend === 'firebase' && _firebase) {
        return await _firebase.Auth.login(username, password);
      }
      let users = this._getUsers();
      if (!users[username]) return { success: false, error: 'Böyle bir kullanıcı yok' };
      if (users[username] !== password) return { success: false, error: 'Şifre hatalı' };
      this._setCurrentUser(username);
      return { success: true };
    },

    async register(username, password) {
      if (_backend === 'firebase' && _firebase) {
        return await _firebase.Auth.register(username, password);
      }
      if (!username || username.length < 3) return { success: false, error: 'Kullanıcı adı en az 3 karakter' };
      if (!password || password.length < 4) return { success: false, error: 'Şifre en az 4 karakter' };
      let users = this._getUsers();
      if (users[username]) return { success: false, error: 'Bu kullanıcı adı zaten var' };
      users[username] = password;
      this._setUsers(users);
      this._setCurrentUser(username);
      return { success: true };
    },

    async guest() {
      if (_backend === 'firebase' && _firebase) {
        return await _firebase.Auth.guest();
      }
      let oldUser = this._getCurrentUser();
      if (oldUser) localStorage.removeItem('farm5_' + oldUser);
      this._setCurrentUser('Misafir');
      return { success: true };
    },

    async logout() {
      if (_backend === 'firebase' && _firebase) {
        await _firebase.Auth.logout();
        return;
      }
      this._clearCurrentUser();
    },

    getUser() {
      return this._getCurrentUser();
    },

    isLoggedIn() {
      return this._getCurrentUser() !== null;
    }
  },

  Data: {
    _key(userId) {
      return 'farm5_' + (userId || 'default');
    },

    async save(userId, state) {
      if (_backend === 'firebase' && _firebase) {
        return await _firebase.Data.save(userId, state);
      }
      state._v = 12;
      localStorage.setItem(this._key(userId), JSON.stringify(state));
    },

    async load(userId) {
      if (_backend === 'firebase' && _firebase) {
        return await _firebase.Data.load(userId);
      }
      let d = localStorage.getItem(this._key(userId));
      if (!d) return null;
      try {
        let l = JSON.parse(d);
        if (l._v !== 12) { localStorage.removeItem(this._key(userId)); return null; }
        return l;
      } catch (e) { return null; }
    },

    deleteSave(userId) {
      if (_backend === 'firebase' && _firebase) {
        _firebase.Data.deleteSave(userId);
        return;
      }
      localStorage.removeItem(this._key(userId));
    },

    exists(userId) {
      if (_backend === 'firebase' && _firebase) {
        return _firebase.Data.exists(userId);
      }
      return localStorage.getItem(this._key(userId)) !== null;
    }
  }
};

export default StorageManager;
