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
    },

    // Snapshots repository name (Required)
    repositoryName: 'es_s3_repository', //repo_name
    // To force to take only perticular indices snapshots ex: "index1,index2" (optional)
    indices: "", // empty string will take snaps for all indices

    // ignore_unavailable: Setting it to true will cause indices that do not exist to be ignored during the snapshot creation.
    // By default, when the ignore_unavailable option is not set and an index is missing, the snapshot request will fail.
    ignore_unavailable: false,

    // include_global_state: By setting it to false, it's possible to prevent the cluster global state to be stored as part of the snapshot.
    include_global_state: false,

    // partial: By default, the entire snapshot will fail if one or more indices participating in the snapshot don't have all the primary shards available.
    // This behavior can be changed by setting it partially to true.
    partial: false,

    // snaps prefix name: snap name will become <prefix>_<todaysDate> ex: snaps_2018-12-26 
    snapsPrefixName: 'snapshot', // defaults to snapshot

    // To delete older snapshots defaults to false
    deleteSnapshots: true,
    // Exipire/Delete older Snaps (optional)
    deleteSnapsOlderThan: '30' // In Days
};