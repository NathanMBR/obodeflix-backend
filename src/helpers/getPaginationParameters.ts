export const getPaginationParameters = (
    page: number | undefined,
    quantity: number | undefined
) => {
    const defaultQuantity = 10;
    const defaultPage = 1;
    const maxQuantity = 50;

    const isQuantityValid = !!quantity && quantity > 0 && quantity <= maxQuantity;
    const isPageValid = !!page && page > 0;

    const take = isQuantityValid ? quantity : defaultQuantity;
    const skip = isPageValid ? take * (page - 1) : take * (defaultPage - 1);

    return {
        take,
        skip
    };
};