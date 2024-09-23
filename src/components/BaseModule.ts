import {MuWidget} from "mu-widget/lib/MuWidget";
import {ColumnInfo, Table} from "mu-widget/lib/components/Table";
import {BaseModuleTL, ButtonDef, ListResult, OrderBy} from "../adminTypes";
import {Pager} from "mu-widget/lib/components/Pager";
import {BaseEdit} from "./BaseEdit";
import {makeHtmlElement, withLoader} from "mu-widget/lib/utils/utils";
import {ComponentBuilder} from "../services/ComponentBuilder";
import {Triggers} from "mu-widget/lib/utils/Triggers";
import {SideModal} from "mu-widget/lib/components/SideModal";

export type ModuleMetaData = {
    name: string;
    label: string;
    section: string;
    icon: string;
    numOrder: number;
    widgetName?: string;
};

export abstract class BaseModule extends MuWidget {

    // @ts-ignore
    public moduleMetaData: ModuleMetaData;

    public static isModule = true;

    public useTable = true;

    // @ts-ignore
    muParent: UiAdmin;

    public abstract tl: BaseModuleTL;

    buttons: ButtonDef[] = [
        { label: "Přidat", mu: "bAdd", cssClass: "primary" },
        { label: "Znovu načíst", mu: "bReload", cssClass: "default" }
    ];

    protected filter: any = {};

    protected orderBy: OrderBy = { dir: "desc", field: "id" };

    public setupTable(table: Table): void|Promise<void> {
        throw Error("Implement method setupTable");
    };

    protected tableFieldTemplates(): string { return ""; }

    protected async getData(filter: any, orderBy: OrderBy, limitFrom: number, limitCount: number): Promise<ListResult<any>> {
        return this.tl.getList(filter, orderBy, limitFrom, limitCount);
    }

    beforeIndex() {
        const cb = new ComponentBuilder();
        this.muAppendContent(`
            <div class="navbar navbar-expand-lg bg-light">`
            + (this.buttons.length
                ? '<div class="toolbox flex-grow-1">' + this.buttons.map(btn => makeHtmlElement('span', {
                    mu: btn.mu ?? null,
                    'class': 'btn btn-' + btn.cssClass
                }, btn.label).outerHTML).join('') + '</div><span mu="navbarTitle" class="navbar-text"></span>'
                : '')
            + `</div>`
        );
        if (this.useTable) {
            this.muAppendContent(
                `<table class="table" mu="table:Table">
                </table>
                <div mu="pager:Pager"></div>`
            );

        }
        UiTriggers.addHandler(
            this.moduleMetaData.name + 'Changed',
            () => this.loadData()
        );
    }

    async afterIndex() {
        this.ui.navbarTitle.textContent = this.moduleMetaData.label;
        if (this.useTable) await this.setupTable(this.table)
        await this.loadData();
    }

    table_order(ev: any, orderColumn: string, orderDirection: "asc"|"desc") {
        this.orderBy = { field: orderColumn, dir: orderDirection };
        this.loadData();
    }

    async loadData() {
        await withLoader(this.container, async () => {
            const data = await this.getData(
                this.filter,
                this.orderBy,
                this.pager.currentItemFrom,
                this.pager.itemPerPage,
            );
            this.table.data = data.items;
            this.table.render();
            this.pager.setItemCount(data.totalCount);
        });
    }

    bReload_click() {
        this.loadData();
    }

    item_edit(row: any) {
        this.openEditor().load(row.id);
    }

    pager_changePage() {
        this.loadData();
    }

    bAdd_click() {
        const editor = this.openEditor();
        editor.load("new");
    }

    openEditor(): BaseEdit {
        const editor = SideModal.open<BaseEdit>(this.moduleMetaData.name + 'Edit', 'Upravit')
        editor.module = this;
        editor.admin = this.muParent;
        return editor;
    }

    get table(): Table { return this.muNamedWidget.table as unknown as Table; }
    get pager(): Pager { return this.muNamedWidget.pager as unknown as Pager; }

    protected commandColumn(buttonDefs: ButtonDef[]): ColumnInfo {
        return new ColumnInfo({
            widgetName: 'UiCommandsCell',
            widgetParams: { buttons: buttonDefs },
            orderable: false,
            filterable: false,
        })
    }

}
