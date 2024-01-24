import { Net } from './interfaces'
import { SimpleWebSocketReader } from './simple-websocket-reader'
import { resolve } from 'url'

/** class simply implements Net interface */
export class SimpleNet implements Net {
    constructor(
        readonly baseURL: string,
        private readonly wsTimeout = 30 * 1000
    ) {
			this.baseURL = baseURL
			this.wsTimeout = wsTimeout
    }

    public async http(
        method: 'GET' | 'POST',
        path: string,
        params?: Net.Params): Promise<any> {
				params = params || {};
        const url = new URL(path, this.baseURL);

        try {
            const response = await fetch(url.href, {
                method,
                body: params.body,
                headers: params.headers,
            });

            if (!response.ok) {
                throw new Error(`${response.status} ${method} ${url.href}`);
            }

            const data = await response.json();

            if (params.validateResponseHeader) {
								params.validateResponseHeader(response.headers);
            }

            return data;
        } catch (err: any) {
            throw new Error(`${method} ${url.href}: ${err.message}`);
        }
    }

    public openWebSocketReader(path: string): Net.WebSocketReader {
        const url = resolve(this.baseURL, path)
            .replace(/^http:/i, 'ws:')
            .replace(/^https:/i, 'wss:')
        return new SimpleWebSocketReader(url, this.wsTimeout)
    }
}

