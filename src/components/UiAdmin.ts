import {MuWidget} from "mu-widget/lib/MuWidget";
import {BaseModule, ModuleMetaData} from "./BaseModule";
import { Triggers } from "mu-widget/lib/utils/Triggers";
import { UiFlashContainer } from "mu-widget/lib/components/UiFlash";
import {MuRouter} from "mu-widget/lib/MuRouter";
import {TypeFromOptional} from "../adminTypes";
import {MuWidgetClass} from "../setup";

export class UiAdmin extends MuWidgetClass { // PR.muWidget.MuWidget {
    modules: ModuleMetaData[] = [];
    modulesByName: Record<string, ModuleMetaData> = {};
    static instance: UiAdmin;
    public static MuWidget : typeof MuWidget;
    public static Triggers : typeof Triggers;
    static UiFlashContainer: typeof UiFlashContainer;

    public router: MuRouter = new MuRouter();

    beforeIndex() {
        UiAdmin.instance = this;
        this.muAppendContent(`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2 side-menu">
                        <h2>Administrace</h2>
                        <ul mu="menuitems" class="list-group">
                            <li class="list-group-item" mu=":AdminMenuItem@menuItem"><a mu="link" class="a w-100"></a></li>
                        </ul>
                    </div>
                    <div class="col-md-10" mu="moduleContainer"></div>
                </div>
            </div>
            <div mu="flashContainer:UiFlashContainer"></div>
        `);

        this.router.addRoute('defaultModule', '/admin/<module></po-+pageOrder=0-id-asc></e-+id=>', ev => {
            // @ts-ignore
            this.loadModule(ev.parameters.module, { pageOrder: ev.parameters.pageOrder });
            if (ev.parameters.id) {
                // @ts-ignore
                this.currentModule.item_edit({ id: parseInt(ev.parameters.id) });
            }
        });

        const widgetClasses = MuWidget.widgetClasses;
        for (const widgetName in widgetClasses) {
            // @ts-ignore
            if (widgetClasses[widgetName].isModule) {
                // @ts-ignore
                const moduleMetaData = { widgetName, ...widgetClasses[widgetName].moduleMetaData };
                this.modules.push(moduleMetaData);
                this.modulesByName[moduleMetaData.name] = moduleMetaData;
            }
        }
        //todo: a=b
        this.modules.sort((a, b) => (a.numOrder < b.numOrder ? -1 : 1));
    }

    afterIndex() {
        for (const module of this.modules) {
            this.muWidgetFromTemplate(
                'menuItem',
                'menuitems',
                { module }
            )
        }
        new Promise(() => this.router.route());
    }

    // @ts-ignore
    protected currentModule: BaseModule;

    public loadModule(moduleName: string, params: TypeFromOptional<BaseModule> = {}) {
        const cWidget = new MuWidget(this.ui.moduleContainer);
        this.ui.moduleContainer.innerHTML = '';
        // @ts-ignore
        this.currentModule = cWidget.muActivateWidget(
            this.ui.moduleContainer,
            {
                // @ts-ignore
                widget: this.modulesByName[moduleName].widgetName,
            },
            {
                muParent: this,
                moduleMetaData: this.modulesByName[moduleName],
                ...params,
            }
        ) as BaseModule;
        this.router.pushUpdate('defaultModule', { module: moduleName });
    }
}

export class AdminMenuItem extends MuWidget {
    // @ts-ignore
    module: ModuleMetaData;
    // @ts-ignore
    muParent: UiAdmin;

    afterIndex() {
        this.ui.link.textContent = this.module.label;
        this.muParent.router.prepareAnchor(this.ui.link, 'defaultModule', { module: this.module.name });
    }

    /* link_click() {
        this.muParent.loadModule(this.module.name);
    } */
}