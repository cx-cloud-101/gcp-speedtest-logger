import CxCloud101Api from './cx-cloud101-api';
import Logger from './logger';
import Speedtest from './speedtest';

export default class SpeedtestLogger {
    private cloud101Api: CxCloud101Api;
    private speedtest: Speedtest;
    private logger: Logger;

    constructor({url, user, device}, logger: Logger) {
        this.logger = logger;
        this.cloud101Api = new CxCloud101Api(url, user, device);
        this.speedtest = new Speedtest({maxServers: 1});
    }

    public async execute() {
        this.logger.log('Running speedtest...');
        return this.speedtest.runTest()
            .then(result => {
                this.logger.log('Posting results to CX Cloud101 Speedtest API');
                return this.cloud101Api.postSpeedtestResult(result);
            })
            .then(() => this.logger.log('Speedtest event successfully posted'))
            .catch(reason => {
                this.logger.error('Failed to run speedtest');
                this.logger.error(reason);
            });
    }
}
