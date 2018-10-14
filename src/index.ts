import * as CommandLineArgs from 'command-line-args';
import * as CommandLineUsage from 'command-line-usage';
import Logger from './logger';
import SpeedtestLogger from './speedtest-logger';

const logger = new Logger();

const options = [
    {name: 'apiUrl', description: 'Cloud101 Speedtest event API', typeLabel: '{underline url}'},
    {name: 'user', alias: 'u', description: 'Username to append to events', typeLabel: '{underline user}'},
    {
        name: 'device', alias: 'd', description: 'Device id to append to events', typeLabel: '{underline device}',
        type: Number,
    },
    {
        name: 'interval', alias: 'i', description: 'Interval to execute test (>= 10)',
        typeLabel: '{underline seconds}', defaultValue: 0,
    },
    {
        name: 'triggerTopic', alias: 't', description: 'PubSub topic to trigger speedtest',
        typeLabel: '{underline topic}',
    },
    {name: 'help', alias: 'h', description: 'Show help text', defaultValue: false, type: Boolean},
];

const usage = [
    {
        header: 'GCP Speedtest Logger',
        content: '',
    },
    {
        header: 'Synopsis',
        content: '$ yarn start <options>...',
    },
    {
        header: 'Options',
        optionList: options,
    },
];

function printUsage() {
    logger.log(CommandLineUsage(usage));
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
        logger.error(`Missing required option(s): ${allMissing}`);
        logger.log('---------------------------------------------');
        printUsage();

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
    const args = CommandLineArgs(options) as {apiUrl, device, user, help, interval, triggerTopic};

    if (args.help) {
        printUsage();
    } else if (validateArgs(args)) {
        const speedtestLogger = new SpeedtestLogger(
            {
                url: 'https://computas-universitet.appspot.com/speedtest',
                user: 'alexander@rosbach.no',
                device: 3,
            },
            logger,
        );

        if (args.interval > 0) {
            logger.log(`Running speedtest logging with interval: ${args.interval}s`);
            speedtestInterval(speedtestLogger, args.interval);
        } else {
            speedtestLogger.execute();
        }
    }
}

run();
