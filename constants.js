module.exports = {

  autonomy: {
    callback_id: 'autonomy',
    text: 'Did you have enough autonomy today?',
    fallback: 'Sorry, buttons are not supported on this',
    color: '#FFB84C',
    actions: [
      {
        name: 'yes',
        text: 'yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'no',
        type: 'button',
        value: 'no'
      }
    ]
  },

  complexity: {
    callback_id: 'complexity',
    text: 'Did you have enough complexity?',
    fallback: 'Sorry, buttons are not supported on this',
    color: '#90D96C',
    actions: [
      {
        name: 'yes',
        text: 'yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'no',
        type: 'button',
        value: 'no'
      }
    ]
  },

  reward: {
    callback_id: 'reward',
    text: 'Did you feel rewarded for your effort?',
    fallback: 'Sorry, buttons are not supported on this',
    color: '#BF60AC',
    actions: [
      {
        name: 'yes',
        text: 'yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'no',
        type: 'button',
        value: 'no'
      }
    ]
  },

  done: {
    text: `:thumbsup: Nice job! All done for today!`,
    fallback: `Nice job! All done for today!`,
    color: '#F2E461'
  },

  help: {

    pretext: ':wave: Need help with `/shokubot`?',

    text: 'Use `/shokubot now` to answer your three questions for today. Or use the commands below to manage your reminders:\n• `/shokubot set`\n• `/shokubot pause`\n• `/shokubot resume`\n• `/shokubot stop`',

    fallback: 'Need help with /shokubot? Use \'shokubot now\' to answer your three questions for today. Or use \'shokubot set\', \'shokubot pause\', \'shokubot resume\' and \'shokubot stop\' to manage your reminders.'

  }

};
