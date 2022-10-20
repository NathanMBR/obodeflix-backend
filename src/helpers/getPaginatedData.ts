interface PaginationParameters {
    take: number;
    skip: number;
    count: number;
    data: Array<any>;
}

export const getPaginatedDataHelper = (paginationParameters: PaginationParameters) => (
    {
        quantityPerPage: paginationParameters.take,
        totalQuantity: paginationParameters.count,
        currentPage: paginationParameters.skip / paginationParameters.take + 1,
        lastPage: Math.ceil(paginationParameters.count / paginationParameters.take),
        data: paginationParameters.data
    }
);