import { SumContract } from "./SumContract";

interface SumControllerRequestPayload {
    firstNumber: number;
    secondNumber?: number;
}

export class SumService {
    constructor(
        private readonly sumRepository: SumContract
    ) { }

    async handle(
        {
            firstNumber,
            secondNumber = 0
        }: SumControllerRequestPayload
    ) {
        try {
            const result = await this.sumRepository.sum(
                {
                    firstNumber,
                    secondNumber
                }
            );

            /* eslint-disable no-console */
            return result;
        } catch (error) {
            console.error(error);
            /* eslint-enable no-console */
        }
    }
}