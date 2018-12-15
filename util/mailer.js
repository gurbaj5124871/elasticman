const log = require('npmlog');
const crypto = require('crypto');
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

let transport;

// Configure mailgen with product branding
const mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        name: 'elasticman',
        link: 'https://github.com/gurbaj5124871/elasticman.git'
    }
});

// Keep track of e-mails previously sent to avoid spamming the same e-mail constantly
const emailHistory = {};

exports.generate = function (options) {
    // Use mailgen to generate the email HTML body and plaintext version
    return {
        html: mailGenerator.generate(options),
        text: mailGenerator.generatePlaintext(options)
    };
};

exports.sendMail = function (mail, config) {
    // Initialize and cache transport object
    if (!transport) {
        transport = nodemailer.createTransport(smtpTransport(config.smtp));
    }

    // Get current unix timestamp in ms
    const now = new Date().getTime();

    // Calculate unique e-mail identifier for this e-mail's contents
    const emailIdentifier = crypto.createHash('sha256').update(mail.text).digest('hex');

    // Make sure we're not spamming the same e-mail constantly (check that at least 30 minutes passed)
    if (emailHistory[emailIdentifier] && emailHistory[emailIdentifier] > now - (60 * 1000 * 30)) {
        return;
    }

    // We're going to send an e-mail now
    emailHistory[emailIdentifier] = now;

    // Prevent Gmail/Inbox grouping / truncating e-mails
    if (mail.html) {
        mail.headers = { 'X-Entity-Ref-ID': 1 };
    }

    // Send it via transport
    transport.sendMail(mail).catch(function(err) {
         // Log error to CLI
        log.error('elasticman', 'Failed to send e-mail: ', err);
    });
};