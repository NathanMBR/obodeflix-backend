import {
    describe,
    it,
    expect
} from "@jest/globals";
import { helloWorld } from "@/helloWorld";

describe("Example test", () => {
    it("Should successfully return \"Hello World!\"", () => {
        expect(helloWorld()).toBe("Hello World!");
    });
});