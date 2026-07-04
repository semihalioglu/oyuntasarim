const StorageManager = {
  getUsers: function() {
    try {
      return JSON.parse(localStorage.getItem('farm_users') || '{}');
    } catch (e) {
      return {};
    }
  },
  saveUsers: function(u) {
    localStorage.setItem('farm_users', JSON.stringify(u));
  },
  save: function(state) {
    state._v = 12;
    localStorage.setItem('farm5', JSON.stringify(state));
  },
  load: function(state) {
    let d = localStorage.getItem('farm5');
    if (d) {
      let l = JSON.parse(d);
      if (l._v !== 12) {
        localStorage.removeItem('farm5');
        return false;
      }
      Object.assign(state, l);
      if (typeof state.roadLevel === 'undefined') state.roadLevel = 0;
      return true;
    }
    return false;
  }
};
export default StorageManager;
