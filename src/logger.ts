export default class Logger {

    public log(message: any) {
        /* tslint:disable:no-console */
        console.log(message);
        /* tslint:enable:no-console */
    }

    public error(message: any) {
        /* tslint:disable:no-console */
        console.error(message);
        /* tslint:enable:no-console */
    }
}
