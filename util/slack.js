const IncomingWebhook = require('@slack/client').IncomingWebhook;

function Slack(slackConfig) {
    this.config = slackConfig;
    this.webhook = new IncomingWebhook(this.config.channelUrl);
}

Slack.prototype.sendWebhookMessage = function (subject, error) {
    const self = this;
    return new Promise(function (resolve, reject) {
        const messageBody = self.generateMessage(subject, error);
        self.webhook.send(messageBody, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
};

Slack.prototype.generateMessage = function (subject, error) {
    const membersToAlert = this.config.notifyMembers !== undefined && this.config.notifyMembers.length > 0 ?
        this.config.notifyMembers.map(username => `<@${username}>`).join(' ') : undefined;
    return {
        attachments: [{
            fallback: error.message,
            pretext: membersToAlert,
            author_name: 'Elastic Man',
            author_link: 'https://github.com/gurbaj5124871/elasticman',
            color: 'danger',
            title: subject,
            text: error.message
        }]
    };
};

module.exports = Slack;