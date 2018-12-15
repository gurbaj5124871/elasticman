<p align="center">
  <a href="https://github.com/gurbaj5124871/elasticman">
    <img
      alt="Elasticman"
      src="https://raw.githubusercontent.com/gurbaj5124871/elasticman/master/img/Asset%201%404x.png"
      width="400"
    />
  </a>
</p>
<p align="center">
  <h1>Elasticman: An elasticsearch monitoring and alerting tool</h1>
</p>

The elastiman constantly monitors the your elasticsearch cluster's health by checking the following:
1. It checks the overall clusters health as if any of the node left the cluster or any shard is not avaliable.
2. It checks over all the nodes present in the cluster following parameters:
   <br>• CPU usage Alert<br>
   • Memory usage alert<br>
   • Disk space usage for all mounts on perticular node<br>
   • Swap Memory alert<br>
   • Open File Descriptors alert<br>
   • Heap usage alert<br>
   
   
Currenty Elasticman supports mail and slack integrations.

## Usage:
Install the package npm:
```shell
npm i elasticman -g
```

Then, create a file called `config.js` and paste the following inside it:
```js
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
```

Modify the configuration file according to your need:

• `smtp` (optional) - the SMTP e-mail configuration for sending alerts (using Gmail, AWS SES, etc)
• `slack` (optional) - the Slack webhook configuration for sending alert messages

Test the SMTP configuration by running:

```shell
elasticman --test-email
```

Test the Slack configuration by running:
```shell
elasticman --test-slack
```

Finally run `elasticman` from the same directory as your `config.js` or you can also provide the confing file's path by running the command `elasticman -c <path to the config file>`

If you want to keep your process running uninterrupted (recommended), it is advisable to use a process manager like [PM2](http://pm2.keymetrics.io/) or [forever](https://www.npmjs.com/package/forever).

## License

Apache 2.0
