import {BaseModuleTL, ButtonDef, CommonResponse, FieldDef} from "../adminTypes";
import {makeHtmlElement, withLoader} from "mu-widget/lib/utils/utils";
import {BaseModule} from "./BaseModule";
import {UiAdmin} from "./UiAdmin";
import {ErrorMarker} from "mu-widget/lib/utils/ErrorMarker";
import {SideModal} from "mu-widget/lib/components/SideModal";
import {UiFlashContainer} from "mu-widget/lib/components/UiFlash";
import {Triggers} from "mu-widget/lib/utils/Triggers";
import {ComponentBuilder} from "../services/ComponentBuilder";

export abstract class BaseEdit extends SideModal {

    public abstract module: BaseModule;

    buttons: ButtonDef[] = [
        { label: "Uložit", mu: "bSave", cssClass: "primary" },
        { label: "Storno", mu: "bClose", cssClass: "secondary" }
    ];

    // @ts-ignore
    admin: UiAdmin;
    // @ts-ignore
    private id: number | null;
    // @ts-ignore
    private errorMarker: ErrorMarker;

    protected async newData(): Promise<any> {
        return {};
    }

    protected async prepareForm(data: any): Promise<void> {

    }

    private lastData: string|null = null;
    public async load(id: number|"new") {
        await withLoader(this.container, async () => {
            const data = await (
                id === "new"
                    ? this.newData()
                    : this.module.tl.getEntity(id)
            );
            await this.prepareForm(data);
            this.muBindData(data);
            this.lastData = JSON.stringify(this.muFetchData());
            this.id = id === "new" ? null : id;
        });
    }

    beforeIndex() {
        const fb = new ComponentBuilder();
        this.muAppendContent(
            '<div class="row">'
            + fb.buildFormFields(this.editFields())
            + '</div>'
            + (this.buttons.length
                ? '<div class="buttons">' + this.buttons.map(btn => makeHtmlElement(
                    'span',
                    {
                        mu: btn.mu ?? null,
                        'class': 'btn btn-' + btn.cssClass
                    }, btn.label).outerHTML).join('') + '</div>'
                : '')

        );
        // @ts-ignore
        this.errorMarker = new ErrorMarker(this);
    }

    abstract editFields(): FieldDef[];

    protected beforeClose(): boolean {
        if (this.lastData !== JSON.stringify(this.muFetchData())) {
            return confirm('Chcete odejít bez uložení změny?');
        }
        return true;
    }

    async bSave_click() {
        const data = this.muFetchData();
        if (await this.beforeSave(this.id, data)) {
            const res = await this.module.tl.saveEntity(this.id, data);
            if (res.status === "ok") {
                await this.afterSave(res.data.id, data, res);
                UiFlashContainer.add('Uloženo', 'ok');
                this.muRemoveSelf();
                Triggers.dispatchAsync(this.module.moduleMetaData.name + 'Changed');
            } else {
                this.errorMarker.markErrors(res.errors);
                UiFlashContainer.add('Není možné uložit. Opravte chyby.', 'error');
            }
        }
    }

    bClose_click() {
        this.close_click();
    }

    protected async beforeSave(id: number|null, data: any): Promise<boolean> {
        return true;
    }

    protected async afterSave(id: number, data: any, response: CommonResponse<any>){ }
}