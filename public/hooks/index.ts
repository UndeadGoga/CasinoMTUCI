import Cookie from 'universal-cookie';


const getOptions = (host?: string) => (options: any) => ({
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    domain: host,
    ...options,
});


class Cookies {
    cookies: any;
    // eslint-disable-next-line no-unused-vars
    getOpts: (options: any) => any;

    constructor(ctx: any, host?: string) {
        this.cookies = new Cookie(ctx);
        // noinspection TypeScriptUnresolvedVariable
        this.getOpts = getOptions(host);
    }

    get = (name: string, options = {}) => this.cookies.get(name, this.getOpts(options))

    set = (
        name: string,
        value?: string | number | null,
        options = {}
    ) => this.cookies.set(name, value, this.getOpts(options))

    remove = (name: string, options?: any) => this.cookies.remove(name, this.getOpts(options))
}

export const index = (cookie?: string, host?: string) => new Cookies(cookie, host);
export const fromRawCookies = (cookie?: string) => new Cookies(cookie);