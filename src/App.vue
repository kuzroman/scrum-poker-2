<template>
    <div class="online" :class="{red: isOffline}">{{ status }}</div>

    <form
      v-if="!hasLogin"
      @submit.prevent="saveName(lobby, name)"
    >
      <label for="lobby">
        <input
          class="inputName" v-model="lobby"
          required
          autocomplete="off"
          placeholder="number of lobby"
          max="9999"
          type="number"
          id="lobby"
          @input="inputLobby"
        />
      </label>
      <label for="name">
        <input
          class="inputName" v-model="name"
          required
          autofocus
          autocomplete="off"
          placeholder="write name & push enter"
          maxlength="10"
          id="name"
          @input="inputName"
        />
      </label>

      <input type="submit" style="position: absolute; left: -9999px"/>
    </form>

    <template v-else>
      <div @click="rename" class="rename">Rename or exit</div>
      <div class="lobby">Lobby:{{ lobby }}</div>

      <div class="scores">
        <div v-for="num in scores"
             class="score"
             :class="{'score__voted': num === score}"
             @click="clickOnScore(num)"
        >{{ num }}
        </div>
      </div>

      <div class="user-list">
        <div v-for="user in usersInLobby"
             class="user"
             :class="{'user__me': user.name === name}"
        >
          <span v-show="adminMode"
                @click="removeUser(user.name)"
                class="clean">X
          </span>
          <div class="user__name">{{ formattedSession(user.name, 'name') }}</div>
          <div class="user__score">
            <span v-if="isShowScore(user.name)">{{ user.score }}</span>
            <span v-else-if="user.score !== 0">V</span>
          </div>
        </div>
      </div>
    </template>

</template>

<script>
const ws = new WebSocket(`ws://${IP}:${import.meta.env.VITE_WEB_SOCKET_PORT}`);
const defaultClick = 10;
let idTimeout;
const SesName = 'SPName';
const defaultConnection = 'OFFLINE';

export default {
  name: 'App',
  data() {
    return {
      hasLogin: '',
      lobby: null,
      name: '',
      score: 0,
      status: defaultConnection,
      users: [],
      scores: [0.5, 1, 2, 3, 5, 8, 13, 21, '?'],
      adminMode: false,
      clickToAdminMode: defaultClick,
    }
  },
  computed: {
    isAllVoted() {
      return !this.usersInLobby.find(i => !i.score);
    },
    usersInLobby() {
      return this.users.filter(i => this.lobby === this.formattedSession(i.name, 'lobby'));
    },
    isOffline() {
      return this.status === defaultConnection;
    }
  },
  methods: {
    rename() {
      this.removeUser(this.name);
      sessionStorage.removeItem(SesName);
      this.hasLogin = false;
      this.name = '';
    },
    setStatus(value) {
      this.status = value;
    },
    send(data) {
      ws.send(JSON.stringify(Object.assign({name: this.name, score: this.score}, data)));
    },
    clickOnScore(num) {
      this.score = this.score === num ? 0 : num;
      this.send({command: 'setScore'});
    },
    saveName(lobby, name) {
      name = lobby + '.' + name.trim();
      if (!lobby || !name || this.findUserByName(name)) {
        return;
      }
      this.name = name;
      this.hasLogin = true;
      sessionStorage.setItem(SesName, this.name);
      this.send({command: 'saveName'});
    },
    restoreSession() {
      let sessionName = sessionStorage.getItem(SesName);
      if (!sessionName) {
        return;
      }
      let lobby = this.formattedSession(sessionName, 'lobby');
      let name = this.formattedSession(sessionName, 'name');
      if (!lobby || !name) {
        return;
      }
      this.name = name;
      this.lobby = lobby;
      this.hasLogin = true;
      this.saveName(lobby, name);
      this.send({command: 'saveName'});
    },
    formattedSession(user, param) {
      let splitted = user.split('.');
      if (param === 'name') {
        return splitted[1] ? splitted[1] : 'OpsName';
      } else if (param === 'lobby') {
        return splitted[0] ? +splitted[0] : 'OpsLobby';
      }
    },
    findUserByName(name) {
      return this.users.find(i => i.name === name);
    },
    removeUser(name) {
      this.send({command: 'removeUser', name});
    },
    adminModeActivator() {
      this.clickToAdminMode--;
      if (this.clickToAdminMode < 0) {
        this.adminMode = true;
      }
      clearTimeout(idTimeout);
      if (this.adminMode) {
        return;
      }
      idTimeout = setTimeout(() => {
        this.clickToAdminMode = defaultClick;
      }, 500)
    },
    isShowScore(name) {
      return this.isAllVoted || name === this.name;
    },
    inputName() {
      this.name = this.name.replace(/[^a-zA-Zа-яА-Я-]+/g, '');
    },
    inputLobby() {
      if (this.lobby.length > 4) {
        this.lobby = this.lobby.slice(0,4);
      }
    },
  },
  created() {
    window.addEventListener('beforeunload', this.rename);
  },
  mounted() {
    ws.onmessage = response => {
      this.users = JSON.parse(response.data);
    };

    ws.onopen = () => {
      this.restoreSession();
      this.setStatus('Online');
    };
    ws.onclose = () => this.setStatus(defaultConnection);

    ws.onerror = (error) => {
      console.log(`[error]`, error);
      this.rename();
    };

    document.body.addEventListener('click', this.adminModeActivator);
  }
};
</script>

<style lang="less">
html,
body {
  height: 100%;
}
body {
  margin: 0;
  background-color: black;
  color: #0F0;
  font-family: 'Consolas', monospace;
}
#app {
  max-width: 480px;
  margin: 0 auto;
}
input {
  outline: none;
  background: #444;
  color: #0F0;
  padding: 8px;
  display: block;
  font-size: 1.5em;
  border: none;
  margin: 8px;
  clear: both;
}
.online {
  margin: 8px;
  float: left;
  cursor: pointer;
}
.rename {
  margin: 8px;
  text-align: right;
  float: right;
  cursor: pointer;
}
.lobby {
  text-align: center;
  width: 100px;
  margin: 0 auto;
  padding-top: 8px;
}
.clean {
  padding: 8px;
  display: inline-block;
}
.save {
  border: 1px solid white;
  display: inline-block;
  font-size: 1.5em;
  padding: 1rem 2rem;
}
.user-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
  user-select: none;

  .user {
    margin: 4px;
    font-size: 21px;
    text-align: center;
    display: inline-block;

    &__me {
      background: #444;
    }

    &__name{
      padding: 8px;
      text-align: center;
      border: 1px solid white;
    }

    &__score {
      height: 50px;
      line-height: 50px;
      font-size: 26px;
      padding: 0 8px;
      text-align: center;
      border: 1px solid white;
    }
  }
}
.scores {
  text-align: center;
  font-size: 26px;
  user-select: none;
  clear: both;

  .score {
    width: 80px;
    height: 80px;
    line-height: 80px;
    border: 1px solid white;
    display: inline-block;
    margin: 4px;
    cursor: pointer;

    &__voted {
      background: #444;
    }
  }
}
.red {
  color: red !important;
}
</style>
