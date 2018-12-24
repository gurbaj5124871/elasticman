const log               = require('npmlog');
const elastic           = require('elasticsearch');
const logger            = require('../util/logger');
const scheduler         = require('node-schedule');

class  snapshots {
    constructor(config) {
        return (async () => {
            if (!config)
                throw new Error('Please provide a valid config file to use elasticman');
            if(config.repositoryName === undefined || config.repositoryName === null || config.hasOwnProperty('repositoryName') === false)
                throw new Error('Please provide ')
            this.config = config;
            await this.initiateSnaphots()
            return this
        })();
    }

    async initiateSnaphots () {
        try {
            await this.repoExistanceCheck(this.config.repositoryName)
            await this.createSnapShot()
            let tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await this.scheduleSnapshots(tomorrow)
            if(this.config.deleteSnapshots === true) {
                await this.scheduleSnapshotsDeletion(tomorrow)
            }
        } catch (err) {
            log.error(err)
        } finally {

        }
    }

    async createClient() {
        try {
            return new elastic.Client({
                host: this.config.nodes,
                sniffOnStart: true,
                sniffInterval: 5000,
                sniffOnConnectionFault: true,
                maxRetries: 3
            })
        } catch (err) {
            log.error(err)
            logger.notifyError(new Error(`Failed to connect to cluster.`, err), this.config);
        }
    }

    async closeClient (client) {
        client.close()
    }

    async repoExistanceCheck(repository) {
        log.info('elasticman', new Date(), 'Repository existance check');
        const client = await this.createClient()
        if(client) {
            try {
                await client.snapshot.getRepository({repository})
            } catch (err) {
                log.error(err)
                throw new Error(`repository missing exception: [${this.config.repositoryName}] missing`)
            }
            await this.closeClient(client)
        }
    }

    async createSnapShot() {
        const client = await this.createClient()
        const repository = this.config.repositoryName
        const prefix = this.config.snapsPrefixName ? `${this.config.snapsPrefixName}_` : `snapshots_`
        const suffix = new Date().toJSON().slice(0,10)
        const snapshot = prefix + suffix
        const body = {
            ignore_unavailable: this.config.ignore_unavailable ? this.config.ignore_unavailable : false,
            include_global_state: this.config.include_global_state ? this.config.include_global_state : true
        }
        if(this.config.hasOwnProperty('partial'))
        body['partial'] = this.config.partial
        else body['partial'] = false
        if(this.config.hasOwnProperty('indices') && this.config.indices.length)
        body['indices'] = this.config.indices
        try {
            await client.snapshot.create({waitForCompletion: true, repository, snapshot, maxRetries: 3, body})
            log.info(`snapshot created: ${snapshot}`)
        } catch (err) {
            log.error(err)
            logger.notifyError(new Error(`Error while creating snapshots.`, err), this.config);
        }
        await this.closeClient(client)
    }

    async deleteSnapshots() {
        const client = await this.createClient()
        const repository = this.config.repositoryName
        const snaps = await client.snapshot.get({repository, snapshot: '_all'})
        console.log('snaps: ',snaps)
        if(snaps.snapshots.length) {
            const olderSnapshots = []
            const today = new Date().toJSON().slice(0,10)
            for(let snap of snaps.snapshots) {
                if(this.subtractDates(new Date(snap.split('_')[1]) - today) > this.config.deleteSnapsOlderThan)
                olderSnapshots.push(snap)
            }
            if(olderSnapshots.length) {
                for(let snap of olderSnapshots)
                await client.snapshot.delete({repository, snapshot: snap})
            }
        }
        await this.closeClient(client)
    }

    subtractDates(date1, date2) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;

        const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    async scheduleSnapshots(scheduleTime) {
        scheduler.scheduleJob('snapshot', scheduleTime, async () => {
            try {
                await this.createSnapShot()
            } finally {
                let tomorrow = scheduleTime;
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.scheduleSnapshots(tomorrow)
            }
        })
    }

    async scheduleSnapshotsDeletion(scheduleTime) {
        scheduler.scheduleJob('deleteSnapshots', scheduleTime, async () => {
            try {
                await this.deleteSnapshots()
            } catch (err) {
                logger.notifyError(new Error(`Error while deleting snapshots`, err), this.config);
            } finally {
                let tomorrow = scheduleTime;
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.scheduleSnapshotsDeletion(tomorrow)
            }
        })
    }
}

module.exports          = snapshots