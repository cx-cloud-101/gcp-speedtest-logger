import * as CommandLineArgs from 'command-line-args';
import * as CommandLineUsage from 'command-line-usage';
import { options, usage } from './cli';
import Logger from './logger';
import PubSubTrigger from './pubsub';
import SpeedtestLogger from './speedtest-logger';

const topicRegex = /^projects\/([a-zA-Z0-9-]+)\/topics\/([a-zA-Z0-9-]+)$/;

const logger = new Logger();

function printUsage() {
    logger.log(CommandLineUsage(usage));
}

function printErrorMessage(message) {
    logger.error(message);
    logger.log('---------------------------------------------');
    printUsage();
}

function validateArgs({apiUrl, user, device}): boolean {
    const missingOptions = [];
    if (!apiUrl) {
        missingOptions.push('apiUrl');
    }
    if (!user) {
        missingOptions.push('user');
    }
    if (!device) {
        missingOptions.push('device');
    }

    if (missingOptions.length > 0) {
        const allMissing = missingOptions.reduce((agg, cur) => `${agg}${agg.length > 0 ? ',' : ''}--${cur}`);
        printErrorMessage(`Missing required option(s): ${allMissing}`);

        return false;
    }

    return true;
}

async function speedtestInterval(speedtestLogger: SpeedtestLogger, interval: number) {
    const intervalMs = interval * 1000;

    const start = Date.now();
    await speedtestLogger.execute();
    const elapsed = Date.now() - start;

    const waitMs = elapsed < intervalMs ? intervalMs - elapsed : 0;
    logger.log(`Waiting ${waitMs}ms for next test`);
    setTimeout(() => speedtestInterval(speedtestLogger, interval), waitMs);
}

function run() {
    const args = CommandLineArgs(options) as { apiUrl, device, user, help, interval, triggerTopic };

    if (args.help) {
        printUsage();
    } else if (validateArgs(args)) {
        const speedtestLogger = new SpeedtestLogger(
            {
                url: args.apiUrl,
                user: args.user,
                device: args.device,
            },
            logger,
        );

        if (args.interval > 0) {
            logger.log(`Running speedtest logging with interval: ${args.interval}s`);
            speedtestInterval(speedtestLogger, args.interval);
        } else if (args.triggerTopic) {
            const topicMatch = args.triggerTopic.match(topicRegex);
            if (topicMatch) {
                const [, project, topic] = topicMatch;
                const trigger = new PubSubTrigger(project, topic, logger);
                trigger.onMessage(args.user, args.device, () => speedtestLogger.execute());
            } else {
               printErrorMessage(`--triggerTopic argument did not match ${topicRegex}: ${args.triggerTopic}`);
            }
        } else {
            speedtestLogger.execute();
        }
    }
}

run();
