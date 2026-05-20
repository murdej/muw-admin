
import {MuWidget} from "mu-widget/lib/MuWidget";
import {ColumnInfo, Table} from "mu-widget/lib/components/Table";
import {BaseModuleTL, ButtonDef, ListResult, OrderBy} from "../adminTypes";
import {Pager} from "mu-widget/lib/components/Pager";
import {BaseEdit} from "./BaseEdit";
import {makeHtmlElement, withLoader} from "mu-widget/lib/utils/utils";
import {ComponentBuilder} from "../services/ComponentBuilder";
import {Triggers} from "mu-widget/lib/utils/Triggers";
import {SideModal} from "mu-widget/lib/components/SideModal";
import {UiAdmin} from "./UiAdmin";
import {UiCommandsCell} from "./UiCommandsCell";
import {MuWidgetClass} from "../setup";

export type ModuleMetaData = {
    name: string;
    label: string;
    section: string;
    icon: string;
    numOrder: number;
    widgetName?: string;
};

export abstract class BaseModule extends MuWidgetClass {

    // @ts-ignore
    public moduleMetaData: ModuleMetaData;

    public static isModule = true;

    public useTable = true;

    // @ts-ignore
    muParent: UiAdmin;

    public abstract tl: BaseModuleTL;

    public static defaultButtons = [
        { label: "Přidat", mu: "bAdd", icon: 'add' },
        { label: "Znovu načíst", mu: "bReload", icon: 'reload' }
    ];

    buttons: ButtonDef[] = [ ...BaseModule.defaultButtons ];

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
        this.moduleInit();
        const cb = new ComponentBuilder();
        this.muAppendContent(`
            <div class="navbar navbar-expand-lg bg-light"><div class="toolbox flex-grow-1" mu="buttonContainer">`
            /* + (this.buttons.length
                ? this.buttons.map(btn => makeHtmlElement('span', {
                    mu: btn.mu ?? null,
                    'class': 'btn btn-' + btn.cssClass
                }, btn.label).outerHTML).join('')
                : '') */

            + cb.buildTableCommands(this.buttons)
            + `</div><span mu="navbarTitle" class="navbar-text"></span></div>`
        );
        this.moduleBeforeIndex();
        if (this.useTable) {
            this.muAppendContent(
                `<table class="table" mu="table:Table">
                </table>
                <div mu="pager:Pager"></div>`
            );

        }
        Triggers.addHandler(
            this.moduleMetaData.name + 'Changed',
            () => this.loadData()
        );
    }

    protected toNav(el: HTMLElement|string|((HTMLElement|string)[])) {
        if (Array.isArray(el)) {
            for (const el1 of el) {
                this.toNav(el1);
            }
        } else {
            if (typeof el === "string") {
                el = this.ui[el];
            }
            this.ui.buttonContainer.appendChild(el);
        }
    }

    async afterIndex() {
        await this.moduleAfterIndex();
        this.ui.navbarTitle.textContent = this.moduleMetaData.label;
        if (this.useTable) await this.setupTable(this.table)
        await this.loadData();
    }

    protected async moduleAfterIndex(): Promise<void> { }

    protected moduleBeforeIndex(): void { }

    protected moduleInit(): void { }

    table_order(ev: any, orderColumn: string, orderDirection: "asc"|"desc") {
        this.orderBy = { field: orderColumn, dir: orderDirection };
        this.loadData();
    }

    async loadData() {
        UiAdmin.instance.router.pushUpdate(null, {
            pageOrder: this.pageOrder,
            filter: this.filter ? JSON.stringify(this.filter) : null,
        });
        await withLoader(this.container, async () => {
            const data = await this.getData(
                this.filter,
                this.orderBy,
                this.pager ? this.pager.currentItemFrom : 0,
                this.pager ? this.pager.itemPerPage : 0,
            );
            await this.renderItems(data);
        });
    }

    bReload_click() {
        this.loadData();
    }

    item_edit(row: any) {
        this.openEditor().load(row.id);
        this.muParent.router.pushUpdate(null, { id: row.id });
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

    protected commandColumn(
        buttonDefs: ButtonDef[],
        afterRender: ((widget: UiCommandsCell, row: any) => void)|null = null,
        widgetParams: Partial<InstanceType<typeof UiCommandsCell>>&Record<string, any> = {},
    ): ColumnInfo {
        return new ColumnInfo({
            widgetName: 'UiCommandsCell',
            widgetParams: { buttons: buttonDefs, afterRender, ...widgetParams },
            orderable: false,
            filterable: false,
        })
    }

    protected async renderItems(data: any) {
        this.table.data = data.items;
        this.table.render();
        this.pager.setItemCount(data.totalCount);
    }

    get pageOrder(): string {
        return `${this.pager?.currentPageNum || '0'}-${this.orderBy.field}-${this.orderBy.dir}`;
    }

    set pageOrder(str: string) {
        if (this.pager) {
            const strp = str.split('-');
            this.orderBy.field = strp[1] || 'id';
            //@ts-ignore
            this.orderBy.dir = strp[2] || 'asc';
            this.pager.currentPageNum = parseInt(strp[0] || '0');
        } else {
            // widget not ready, call after index
            this.muOnAfterIndex.push(() => this.pageOrder = str);
        }
    }
}
