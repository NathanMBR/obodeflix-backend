import {
    jest,
    describe,
    it,
    expect
} from "@jest/globals";
import { SumService } from "../src/SumService";

interface RepositorySpyData {
    firstNumber: number;
    secondNumber?: number;
}
interface RepositorySpyOptions {
    someOption: boolean
}

const sumRepositorySpy = jest.fn(
    async (
        data: RepositorySpyData,
        _options?: RepositorySpyOptions
    ) => Promise.resolve(data.firstNumber + (data.secondNumber || 0))
);

const serviceToTest = new SumService(
    {
        sum: sumRepositorySpy
    }
);

describe(
    "Sum tests",
    () => {
        it(
            "Should successfully sum two numbers",
            async () => {
                const fakeServiceResult = serviceToTest.handle(
                    {
                        firstNumber: 2,
                        secondNumber: 3
                    }
                );

                expect(fakeServiceResult).resolves.not.toThrow();
                expect(fakeServiceResult).resolves.toBe(5);
                expect(sumRepositorySpy).toHaveBeenCalled();
            }
        );
    }
);