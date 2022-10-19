export class HttpError {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly reason?: string | Array<string>
    ) { }
}