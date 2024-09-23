import {MuWidget} from "mu-widget/lib/MuWidget";
import {BaseModule, ModuleMetaData} from "./BaseModule";
import {PR} from "../classRegister";
import {AnyElement} from "mu-widget/lib/MuWidget";
import { Triggers } from "mu-widget/lib/utils/Triggers";
import { UiFlashContainer } from "mu-widget/lib/components/UiFlash";

export class UiAdmin extends MuWidget { // PR.muWidget.MuWidget {
    modules: ModuleMetaData[] = [];
    modulesByName: Record<string, ModuleMetaData> = {};
    static instance: UiAdmin;
    public static MuWidget : typeof MuWidget;
    public static Triggers : typeof Triggers;
    static UiFlashContainer: typeof UiFlashContainer;

    beforeIndex() {
        UiAdmin.instance = this;
        this.muAppendContent(`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2">
                        <h2>Nabídka</h2>
                        <ul mu="menuitems" class="list-group">
                            <li class="list-group-item" mu=":AdminMenuItem@menuItem"><a mu="link" class="a w-100"></a></li>
                        </ul>
                    </div>
                    <div class="col-md-10" mu="moduleContainer"></div>
                </div>
            </div>
            <div mu="flashContainer:UiFlashContainer"></div>
        `);
        // @ts-ignore
        // SideModal.container = this.container;
        for (const widgetName in UiAdmin.muWidget) {
            // @ts-ignore
            if (UiAdmin.muWidget.widgetClasses[widgetName].isModule) {
                // @ts-ignore
                const moduleMetaData = { widgetName, ...UiAdmin.muWidget.widgetClasses[widgetName].moduleMetaData };
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
        this.loadModule(this.modules[0].name);
    }

    public loadModule(moduleName: string) {
        const cWidget = new UiAdmin.MuWidget(this.ui.moduleContainer);
        this.ui.moduleContainer.innerHTML = '';
        // @ts-ignore
        const widget = cWidget.muActivateWidget(
            this.ui.moduleContainer,
            {
                // @ts-ignore
                widget: this.modulesByName[moduleName].widgetName,
            },
            {
                muParent: this,
                moduleMetaData: this.modulesByName[moduleName],
            }
        ) as BaseModule;
    }
}

export class AdminMenuItem extends MuWidget {
    // @ts-ignore
    module: ModuleMetaData;
    // @ts-ignore
    muParent: UiAdmin;

    afterIndex() {
        this.ui.link.textContent = this.module.label;
    }

    link_click() {
        this.muParent.loadModule(this.module.name);
    }
}