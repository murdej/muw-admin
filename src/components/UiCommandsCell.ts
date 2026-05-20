import {CellValueTranformerEvent, TableCell} from "mu-widget/lib/components/Table";
import {ButtonDef} from "../adminTypes";
import {ComponentBuilder} from "../services/ComponentBuilder";


export class UiCommandsCell extends TableCell {
    public buttons: ButtonDef[] = [];
    public row: any;
    public afterRender: null|((widget: UiCommandsCell, row: any) => void) = null;

    beforeIndex() {
        const cb = new ComponentBuilder();
        this.muAppendContent(`<div class="ui-commands-cell__coontainer">${cb.buildTableCommands(this.buttons)}</div>`);
        this.container.classList.add("ui-commands-cell");
    }

    command(ev: Event, cmd: string) {
        if (!this.muParent.muParent.muParent['item_' + cmd])
            throw new Error(`Command 'item_${cmd}' not found`);
        this.muParent.muParent.muParent['item_' + cmd](this.row);
    }

    render(value: any, row: any, ev: CellValueTranformerEvent) {
        this.row = row;
        if (this.afterRender) this.afterRender(this, row);
    }
}