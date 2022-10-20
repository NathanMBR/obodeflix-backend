declare namespace Express {
    export interface Request {
        user?: {
            sub: number;
            type: import("@prisma/client").UserTypes;
        };
    }
}