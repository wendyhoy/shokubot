module.exports = {

  done: ':thumbsup: Nice job! All done for today!',
  error: 'Sorry, something went wrong.',
  reminder: ':wave: Here are your questions for today.',

  setReminders: ':thumbsup: I\'ve set your reminders.',
  pauseReminders: ':thumbsup: I\'ve paused your reminders. Hope you come back soon!',
  unpauseReminders: ':thumbsup: I\'ve unpaused your reminders.',
  nextReminder: 'Your next reminder is ',

  infoPaused: 'Your reminders are currently paused. They\'re set for ',
  infoActive: 'Your reminders are currently active. They\'re set for ',
  tryAgain: 'You\'ve answered all your questions for today. They\'ll be available again tomorrow.',
  noReminders: 'You don\'t have any reminders. Use `/shokubot remind` to set your next reminder.',

  welcome: 'Hello, I\'m Shokubot. I\'m here to help you track your team\'s wellness. Team members can set a daily reminder by typing `/shokubot remind [when]` from any channel, and I\'ll send them their reminders directly to answer three simple questions about their day. To see how your team is doing, visit the Shokubot website. If you need more assistance, type `/shokubot help`.',

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

  remind: {
    pretext: ':wave: Need help with `/shokubot remind`?',

    text: 'Use `/shokubot remind` to tell shokubot when to send your three questions. Examples include:\n• `/shokubot remind me every weekday at 5pm`\n• `/shokubot remind me Monday to Thursday at 4:30pm`\n• `/shokubot remind me Monday, Wednesday, and Friday at 9am`\n',

    fallback: 'Need help with \'/shokubot remind\'? Use \'/shokubot remind\' to tell shokbut when to send your three questions. Examples include:\n• \'/shokubot remind me every weekday at 5pm\'\n• \'/shokubot remind me Monday to Thursday at 4:30pm\'\n• \'/shokubot remind me Monday, Wednesday, and Friday at 9am\'\n',
  },

  help: {
    pretext: ':wave: Need help with `/shokubot`?',

    text: 'Use `/shokubot now` to answer your three questions for today. Or use the commands below to manage your reminders:\n• `/shokubot remind`\n• `/shokubot pause`\n• `/shokubot unpause`\n• `/shokubot info`',

    fallback: 'Need help with \'/shokubot\'? Use \'shokubot now\' to answer your three questions for today. Or use \'shokubot remind\', \'shokubot pause\', \'shokubot unpause\' and \'shokubot info\' to manage your reminders.'
  }

};
