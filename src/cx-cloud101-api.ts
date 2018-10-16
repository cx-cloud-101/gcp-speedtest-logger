import axios, { AxiosResponse } from 'axios';
import { SpeedtestResult } from './speedtest';

export default class CxCloud101Api {
    constructor(private url: string,
                private user: string,
                private device: number) {
    }

    public async postSpeedtestResult(result: SpeedtestResult): Promise<AxiosResponse<SpeedtestEvent>> {
        const event: SpeedtestEvent = {
            user: this.user,
            device: this.device,
            data: result,
            timestamp: Date.now(),
        };
        return axios.post<SpeedtestEvent>(this.url, event);
    }
}

export interface SpeedtestEvent {
    user: string;
    device: number;
    data: SpeedtestResult;
    timestamp: number;
}
