export namespace SumContract {
    export interface Payload {
        firstNumber: number;
        secondNumber?: number;
    }

    export interface Options {
        someOption: boolean;
    }

    export type Result = Promise<number>;
}

export interface SumContract {
    sum: (
        data: SumContract.Payload,
        options?: SumContract.Options
    ) => SumContract.Result
}