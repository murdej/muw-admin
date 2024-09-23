import {CellValueTranformerEvent, TableCell} from "mu-widget/lib/components/Table";
import {ButtonDef} from "../adminTypes";
import {ComponentBuilder} from "../services/ComponentBuilder";


export class UiCommandsCell extends TableCell {
    public buttons: ButtonDef[] = [];
    public row: any;

    beforeIndex() {
        const cb = new ComponentBuilder();
        this.muAppendContent(cb.buildTableCommands(this.buttons));
    }

    command(ev: Event, cmd: string) {
        this.muParent.muParent.muParent['item_' + cmd](this.row);
    }

    render(value: any, row: any, ev: CellValueTranformerEvent) {
        this.row = row;
    }
}