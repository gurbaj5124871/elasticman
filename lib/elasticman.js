const log               = require('npmlog');
const elastic           = require('elasticsearch');
const logger            = require('../util/logger');

class elasticman {
    constructor(config) {
        return (async () => {
            if (!config) {
                throw new Error('Please provide a valid config file to use elasticman');
            }
            this.config = config;
            await this.initiatePatrolling()
            return this
        })();
    }

    async initiatePatrolling () {
        try {
            await this.callSideKick(this.config);
        }
        finally {
            // Schedule this task again in the future recursively
            setTimeout(this.initiatePatrolling.bind(this), this.config.interval * 1000);
        }
    }

    async callSideKick() {
        log.info('elasticman', new Date(), 'Calling Sidekick');
        let sideKick
        try {
            sideKick = new elastic.Client({
                host: this.config.nodes,
                sniffOnStart: true,
                sniffInterval: 5000,
                sniffOnConnectionFault: true,
                maxRetries: 3
            })

            await this.fetchClusterhealth(sideKick)
            await this.fetchNodesHealth(sideKick)
        } catch (err) {
            console.log(err)
            logger.notifyError(new Error(`Failed to connect to cluster.`, err), this.config);
        }
        finally {
            sideKick.close()
        }
    }

    async fetchClusterhealth (sideKick) {
        const clusterhealth = await sideKick.cluster.health()
        if(clusterhealth.status != 'green') {
            logger.notifyError(new Error(`cluster ${clusterhealth.cluster_name}'s health is not good: `, clusterhealth), this.config);
        }
    }

    async fetchNodesHealth (sideKick) {
        const nodesStats = await sideKick.nodes.stats({})
        const clusterName = nodesStats.cluster_name
        if(nodesStats._nodes.failed)
        logger.notifyError(new Error(`cluster ${clusterName}: Failed to fetch data for ${nodesStats._nodes.failed} nodes`), this.config);

        for (let node in nodesStats.nodes) {
            const nodeInfo = {name: nodesStats.nodes[node].name, ip: nodesStats.nodes[node].ip, roles: nodesStats.nodes[node].roles},
            os = nodesStats.nodes[node].os, process = nodesStats.nodes[node].process, jvm = nodesStats.nodes[node].jvm, breakers = nodesStats.nodes[node].breakers,
            discovery = nodesStats.nodes[node].discovery, fs = nodesStats.nodes[node].fs;

            // os checks
            if(os.cpu.percent >= this.config.maxCpuUsage)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n cpu usage: ${os.cpu.percent}`), this.config, 'ALerting CPU Usage');
            if(os.mem.free_percent >= this.config.maxMemoryInUse)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n mem usage: ${os.mem.free_percent}`), this.config, 'ALerting Memory Usage');
            if((os.swap.free_in_bytes / os.swap.total_in_bytes * 100) >= this.config.maxSwapMemory)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n swap mem usage: ${os.swap.free_in_bytes / 1000000} mb`), this.config, 'ALerting Swap Memory Usage');

            // process check
            if(process.open_file_descriptors - process.max_file_descriptors * this.config.maxOpenFileDescriptors / 100 >= 0)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n Open File Descriptors usage: ${process.open_file_descriptors}`), this.config, 'ALerting open file descriptors');

            // fs check
            if(fs.total.available_in_bytes / fs.total.total_in_bytes * 100 >= this.config.maxDataSpaceInUse)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n Available Storage: ${fs.total.available_in_bytes / 1000000} mb`), this.config, 'Alerting Total node storage available');
            for (let mount of fs.data) {
                if(mount.free_in_bytes / fs.total.total_in_bytes * 100 >= this.config.maxDataSpaceInUse)
                logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)}: \n  path: ${mount.path}, \n mount: ${mount.mount}, \n type: ${mount.type}, \n Available Storage: ${mount.available_in_bytes/ 1000000} mb`), this.config, 'Alerting Total node storage available');
            }

            // jvm check
            if(jvm.mem.heap_used_percent >= this.config.maxHeapUsed)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)} \n heap size used: ${jvm.mem.heap_used_percent}%,\n Heap Used: ${jvm.mem.heap_used_in_bytes / 100000} mb, \n Max Heap: ${jvm.mem.heap_max_in_bytes / 100000}`), this.config, 'Alerting Heap Size');
            if(jvm.threads.peak_count - jvm.threads.count < 5)
            logger.notifyError(new Error(`cluster: ${clusterName}, Node: ${JSON.stringify(nodeInfo)} \n Peak jvm thread count: ${jvm.threads.peak_count},\n Currently threads in use: ${jvm.threads.count}`), this.config, 'Alerting JVM thread count');

            // discovery
        }
    }
}

module.exports          = elasticman