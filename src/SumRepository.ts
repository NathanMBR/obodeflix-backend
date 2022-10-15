import { SumContract } from "./SumContract";

export class SumRepository implements SumContract {
    async sum(
        {
            firstNumber,
            secondNumber = 0
        }: SumContract.Payload,
        _option?: SumContract.Options
    ) {
        const sum = firstNumber + secondNumber;
        return new Promise<number>((resolve, _reject) => resolve(sum));
    }
}