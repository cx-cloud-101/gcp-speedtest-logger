import * as speedtest from 'speedtest-net';

export default class Speedtest {
    constructor(private options: SpeedtestOptions = {}) {
    }

    public async runTest(): Promise<SpeedtestResult> {
        return new Promise<SpeedtestResultResponse>((resolve, reject) => {
            const test = speedtest(this.options);

            test.on('data', data => resolve(data));
            test.on('error', error => reject(error));
        }).then(response => ({
            ...response,
            server: {
                ...response.server,
                country: response.server.cc,
            },
        }));
    }
}

export interface SpeedtestResult {
    speeds: {
        download: number;
        upload: number;
    };

    client: {
        ip: string;
        lat: number;
        lon: number;
        isp: string;
        country: string;
    };

    server: {
        host: string;
        lat: number;
        lon: number;
        country: string;
        distance: number;
        ping: number;
        id: string;
    };
}

export interface SpeedtestResultResponse {
    speeds: {
        download: number;
        upload: number;
        originalDownload: number;
        originalUpload: number;
    };

    client: {
        ip: string;
        lat: number;
        lon: number;
        isp: string;
        isprating: number;
        rating: number;
        ispdlavg: number;
        ispulavg: number;
        country: string;
    };

    server: {
        host: string;
        lat: number;
        lon: number;
        location: string;
        country: string;
        cc: string;
        sponsor: string;
        distance: number;
        distanceMi: number;
        ping: number;
        id: string;
    };
}

export interface SpeedtestOptions {
    /**
     * The proxy for upload or download, support http and https (example : "http://proxy:3128")
     */
    proxy?: string;

    /**
     * The maximum length of a single test run (upload or download)
     */
    maxTime?: number;

    /**
     * The number of close servers to ping to find the fastest one
     */
    pingCount?: number;

    /**
     * The number of servers to run a download test on.
     * The fastest is used for the upload test and the fastest result is reported at the end.
     */
    maxServers?: number;

    /**
     * Headers to send to speedtest.net
     */
    headers?: {[key: string]: string};

    /**
     * ID of the server to restrict the tests against.
     */
    serverId?: string;

    /**
     * URL to obtain the list of servers available for speed test.
     * (default: http://www.speedtest.net/speedtest-servers-static.php)
     */
    serversUrl?: string;
}
