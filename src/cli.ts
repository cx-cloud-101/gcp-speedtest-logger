import { OptionDefinition, Section } from 'command-line-usage';

export const options: OptionDefinition[] = [
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
        name: 'triggerTopic', alias: 't',
        description: 'PubSub topic to trigger speedtest (format: projects/<project>/topics/<topic>',
        typeLabel: '{underline topic}',
    },
    {name: 'help', alias: 'h', description: 'Show help text', defaultValue: false, type: Boolean},
];

export const usage: Section[] = [
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
