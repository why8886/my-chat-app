export default ({
    state: {
        messages: [],
        conversationId: Math.random(),
    },
    mutations: {
        ADD_MESSAGE(state, payload) {
          state.messages.push(payload);
        },
        SET_CONVERSATION_ID(state, id) {
          state.conversationId = id;
        }
    },
    actions: {
        async sendMessage({ commit, state }, content) {
          const response = await this._vm.$dify.sendMessage({
            inputs: {},
            query: content,
            conversation_id: state.conversationId
          });
          commit('ADD_MESSAGE', { role: 'user', content });
          return response.data;
        }
    }
});