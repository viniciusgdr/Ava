import { avaTrilhas } from './functions';
import { IAvaTrilhasResponse, IConfig } from './types';

export * from './functions';
export * from './types';

export class Ava {
    private avaUrl: string;
    private user: string;
    private key: string;

    constructor(avaUrl: string, user: string, key: string) {
        this.avaUrl = avaUrl;
        this.user = user;
        this.key = key;
    }

    public async avaTrilhas(config?: IConfig): Promise<IAvaTrilhasResponse> {
        return await avaTrilhas(this.avaUrl, this.user, this.key, {...config});
    }
};