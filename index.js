#!/usr/bin/env node

const path = require('path');
const log = require('npmlog');
const program = require('commander');
const elasticman = require('./lib/elasticman');
const snapshots = require('./lib/snapshots');
const logger = require('./util/logger');
// Define CLI arguments and options
program
    .version('1.0.0')
    .option('--test-email', 'send a test e-mail to verify SMTP config')
    .option('-c, --config <path>', 'provide a custom path to the elasticman config file')
    .parse(process.argv);

// Determine absolute path to config file
const configPath = path.resolve(program.config || 'config.js');
// Log config file path
log.info('elasticman', `Initializing using the following config file: ${configPath}`);

// Attempt to load config file
const config = require(configPath);

// Send test e-mail flag passed?
if (program.testEmail) {
    return logger.notifyError(new Error('This is a test e-mail alert for testing the SMTP config.'), config, 'Test E-mail Alert');
}

// Start monitoring
(async ()=> {
    await new elasticman(config)
    if(config.repositoryName.length)
    await new snapshots(config)
})();

process.on('unhandledRejection', (err) => {
    log.error(err)
    process.exit(1);
});