module.exports = {

  autonomy: {
    callback_id: 'autonomy',
    text: 'Did you have enough autonomy today?',
    fallback: 'Sorry, buttons are not supported on this',
    color: '#FFB84C',
    actions: [
      {
        name: 'yes',
        text: 'Yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'No',
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
        text: 'Yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'No',
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
        text: 'Yes',
        type: 'button',
        value: 'yes'
      },
      {
        name: 'no',
        text: 'No',
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

  remind: {
    pretext: ':wave: Need help with `/shokubot remind`?',

    text: 'Use `/shokubot remind` to tell shokubot when to send your three questions. Examples include:\n• `/shokubot remind me every weekday at 5pm`\n• `/shokubot remind me Monday to Thursday at 4:30pm`\n• `/shokubot remind me Monday, Wednesday, and Friday at 9am`\n',

    fallback: 'Need help with \'/shokubot remind\'? Use \'/shokubot remind\' to tell shokbut when to send your three questions. Examples include:\n• \'/shokubot remind me every weekday at 5pm\'\n• \'/shokubot remind me Monday to Thursday at 4:30pm\'\n• \'/shokubot remind me Monday, Wednesday, and Friday at 9am\'\n',
  },

  help: {
    pretext: ':wave: Need help with `/shokubot`?',

    text: 'Use `/shokubot now` to answer your three questions for today. Or use the commands below to manage your reminders:\n• `/shokubot remind`\n• `/shokubot pause`\n• `/shokubot resume`\n• `/shokubot stop`',

    fallback: 'Need help with \'/shokubot\'? Use \'shokubot now\' to answer your three questions for today. Or use \'shokubot remind\', \'shokubot pause\', \'shokubot resume\' and \'shokubot stop\' to manage your reminders.'
  }

};
