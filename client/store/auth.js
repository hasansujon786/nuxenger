import gql from 'graphql-tag'
import { SIGN_IN_MUTATION, SIGN_OUT_MUTATION, ME_QUERY, SIGN_UP_MUTATION } from '../gql'

export const state = () => ({
  loading: true,
  error: false,
  authUser: {},
  authPagOnfirstLoad: false
})

// mutations ==============================
export const mutations = {
  _setAuthUser(state, newAuthUser) {
    state.authUser = newAuthUser
  },
  _setLoading(state, bool) {
    state.loading = bool
  },
  _authPagOnfirstLoad(state, bool) {
    state.authPagOnfirstLoad = bool
  }
}

// actions ==============================
export const actions = {
  setLoading({ state, commit }, bool) {
    // console.log('authPagOnfirstLoad', state.authPagOnfirstLoad)
    if (state.authPagOnfirstLoad && !state.authUser) {
      // Auth Middleware (token && authUser === null && loading)
      console.info('redirecting for invalid token & first load')
      this.$router.push('/login')
      commit('_setLoading', bool)
    }

    commit('_setLoading', bool)
  },
  authPagOnfirstLoad({ commit }, bool) {
    // Auth Middleware (token && authUser === null && loading)
    commit('_authPagOnfirstLoad', bool)
  },
  setAuthUser({ commit }, { id, name, username, chats, path }) {
    commit('_setAuthUser', { id, name, username })

    this.commit('chat/_getChatList', chats)
    if (path === '/' || path === '/chats' || path === '/login') {
      // console.log('redirect form setAuther dispatc')
      chats.length > 0
        ? this.$router.push({ name: 'chats-chatId', params: { chatId: chats[0].id } })
        : this.$router.push({ name: 'chats-chatId' })
    }
  },
  async signIn({ dispatch }, { email, password, path }) {
    try {
      // Call to the graphql mutation
      const { data } = await this.$router.app.$apollo.mutate({
        mutation: SIGN_IN_MUTATION,
        variables: {
          email,
          password
        }
      })

      if (data.signIn) {
        // set authUser & chatList & redirect
        dispatch('setAuthUser', { ...data.signIn, path })
      } else {
        this.$router.push('/login')
      }
    } catch (err) {
      this.$router.push('/login')
      console.log({ err })
    }
  },
  async signOut({ commit }) {
    try {
      const { data } = await this.$router.app.$apollo.mutate({
        mutation: SIGN_OUT_MUTATION
      })

      if (data.signOut) {
        this.$router.push('/login')
        setTimeout(() => {
          commit('_setAuthUser', null)
        }, 500)
      }
    } catch (err) {
      console.log('error in signOut', { err })
    }
  },
  async getAuthUserOnAppLoads({ dispatch }, { path }) {
    console.info('app first load from vuex')
    // Runs on App first loads
    if (!getters.loading) return // If app isn't loadin then exit & stop executing
    try {
      const { data } = await this.$router.app.$apollo.query({
        query: ME_QUERY
      })
      // console.log({ authUser: data.me })

      if (data.me) {
        // set authUser & chatList & redirect
        dispatch('setAuthUser', { ...data.me, path })

        setTimeout(() => dispatch('setLoading', false), 100)
      } else {
        this.$router.push('/login')
        dispatch('setLoading', false)
      }
    } catch (err) {
      this.$router.push('/login')
      dispatch('setLoading', false)
      console.log({ err })
    }
  },
  async signUp({}, { email, password, username, fullname }) {
    try {
      // Call to the graphql mutation
      const { data } = await this.$router.app.$apollo.mutate({
        mutation: SIGN_UP_MUTATION,
        variables: {
          email,
          password,
          username,
          fullname
        }
      })

      // TODO: Show a successfull popup
      // if(data.signUp) { }

      this.$router.push('/login')
    } catch (err) {
      console.log({ err })
    }
  }
}

// getters ==============================
export const getters = {
  authUser: state => state.authUser,
  loading: state => state.loading,
  error: state => state.error
}
