export type CommonResponse<T> = {
    status: "ok"|"error"|string;
    message: string;
    data: T;
    errors: any;
}

export type MultiControlItem = {
    value: string;
    name: string;
    disabled: boolean;
} & any

export type FieldDef = {
    type: FieldType;
    label: string;
    name: string;
    required: boolean;
    colSize?: string|string[];
}|string;

export type FieldType = "text" | "html" | "number"|"email"|"tel"|"url"|"select";

export interface BaseModuleTL {

    getList(filter: any, order: OrderBy, limitFrom: number, limitCount: number) : Promise<ListResult<any>>;

    getEntity(id: number): Promise<any>;

    saveEntity(id: number | null, data: any): Promise<CommonResponse<any>>;
}

export type ListResult<T> = {
    items: T[];
    totalCount: number;
    limitFrom: number;
    limitCount: number|null;
}

export type ButtonDef = {
    label: string,
    mu?: string,
    cssClass?: string|string[],
    command?: string,
}

export type TypeFromOptional<T> = {
    [K in keyof T]?: T[K];
};

export type OrderBy = { field: string, dir: "asc"|"desc" };

export type OrderByStr = `${string} ${"asc"|"desc"}`|`${string}`;
