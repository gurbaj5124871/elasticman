const log = require('npmlog');
const mailer = require('./mailer');
const Slack = require('./slack');

let slack;

exports.notifyError = function (error, config, subject) {
    // Fallback to generic subject
    subject = subject || 'Health Check Failed';

    // Log error to CLI
    log.error('elasticman', new Date(), error.message);

    // Email the error if smtp settings present
    if (config.smtp !== undefined) {
        // Generate e-mail using mailgen
        const mail = mailer.generate({
            body: {
                title: subject,
                intro: error.message,
                outro: 'We thank you for choosing elasticman.'
            }
        });

        // Send mail via mailer
        mailer.sendMail({
            from: config.smtp.address,
            to: config.smtp.address,
            subject: `[elasticman] ${subject}`,
            html: mail.html,
            text: mail.text
        }, config);
    }

    // Send Slack message if webhook settings present
    if (config.slack !== undefined) {
        if (slack === undefined) {
            slack = new Slack(config.slack);
        }
        slack.sendWebhookMessage(subject, error)
            .catch(function (slackError) {
                log.error('elasticman', new Date(), slackError.message)
            });
    }
};