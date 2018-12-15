module.exports = {
    // Elasticsearch Cluster Nodes uri's
    nodes: [
        'http://localhost:9200'
    ],
    // Number of seconds to wait in between health checks
    interval: 30,
    // Alerting CPU usage in percent
    maxCpuUsage: 50,
    // Cutoff Nodes memory in percentage
    maxAvailableMemoryInUse: 60,
    // Alerting data space in percentage (will calculate for all the mount storages)
    maxDataSpaceInUse: 80,
    // alerting OS swap memory in percentage
    maxSwapMemory: 50,
    // alerting open file descriptors in percentage
    maxOpenFileDescriptors: 80,
    // Alerting jvm heap size in percentage
    maxHeapUsed: 80,
    // SMTP configuration for sending alert e-mails (delete to disable)
    smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'username@gmail.com',
            pass: 'password'
        },
        address: 'username@gmail.com'
    },
    // Slack configuration for sending alert messages through webhook (delete to disable)
    slack: {
        channelUrl: 'https://hooks.slack.com/services/xxx/xxx/xxx',
        notifyMembers: ['gurbaj', 'singh'] // enter slack user names here
    }
};