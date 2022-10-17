type GenericModel = Record<string, any>;

export namespace RepositoryContract {
    export interface SearchFilters<T extends GenericModel> {
        take: number;
        skip: number;
        search?: string;
        sortColumn: keyof T;
        sortDirection: "asc" | "desc";
    }
}

export interface RepositoryContract<T extends GenericModel> {
    create(data: T): Promise<T>;
    findOneBy(key: keyof T, value: T[typeof key]): Promise<T | null>;
    findAll(filters: RepositoryContract.SearchFilters<T>): Promise<Array<T>>;
    countAll(filters: RepositoryContract.SearchFilters<T>): Promise<number>;
    update(id: number, data: T): Promise<T | null>;
    inactivate(id: number): Promise<T | null>;
}