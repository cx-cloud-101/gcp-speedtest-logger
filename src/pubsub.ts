import * as PubSub from '@google-cloud/pubsub';
import * as RandomString from 'randomstring';
import Logger from './logger';

export default class PubSubTrigger {
    private pubSubClient;
    private subscriptionName: string;
    private messageCallbacks: {[user: string]: {[device: number]: () => Promise<void>}} = {};

    constructor(projectId: string, private topic: string, public logger: Logger) {
        this.pubSubClient = new PubSub({projectId});
        this.subscriptionName = `gcp-speedtest-logger-${RandomString.generate(7)}`;
        this.createSubscription()
            .then(() => this.listenToSubscription());
        this.registerProcessCleanUp();
    }

    public onMessage(user: string, device: number, callback: () => Promise<void>) {
        const userCallbacks = this.messageCallbacks[user] || {};
        this.messageCallbacks = {
            ...this.messageCallbacks,
            [user]: {
                ...userCallbacks,
                [device]: callback,
            },
        };
        this.logger.log(`Registered pubsub trigger for user '${user}' and device '${device}'`);
    }

    private listenToSubscription() {
        this.pubSubClient.subscription(this.subscriptionName)
            .on('message', message => {
                const triggerMsg: TriggerMessage = JSON.parse(message.data);

                const callback = (this.messageCallbacks[triggerMsg.user] || {})[triggerMsg.device];
                if (callback) {
                    this.logger
                        .log(`Triggering callback for user '${triggerMsg.user}' and device '${triggerMsg.device}'`);

                    callback()
                        .then(() => message.ack());
                } else {
                    this.logger
                        .log(`No callback registered for '${triggerMsg.user}' and device '${triggerMsg.device}'`);

                    message.ack();
                }
            });
    }

    private createSubscription() {
        return this.pubSubClient.topic(this.topic)
            .createSubscription(this.subscriptionName)
            .then(results =>
                this.logger.log(`Subscription ${this.subscriptionName} for topic ${this.topic} created.`))
            .catch(err => {
                this.logger.error(`Error creating subscription ${this.subscriptionName}: ${err}`);
                throw err;
            });
    }

    private removeSubscription() {
        return this.pubSubClient.subscription(this.subscriptionName)
            .delete()
            .then(() => this.logger.log(`Subscription ${this.subscriptionName} deleted.`))
            .catch(err => this.logger.error(`Failed to delete subscription ${this.subscriptionName}: ${err}`));
    }

    private registerProcessCleanUp() {
        const subscriptionCleanUp = () => {
            this.removeSubscription()
                .then(() => {
                    process.exit(0);
                });
        };

        process.on('SIGTERM', subscriptionCleanUp);
        process.on('SIGINT', subscriptionCleanUp);
    }
}

export interface TriggerMessage {
    user: string;
    device: number;
}
