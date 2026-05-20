import * as uiAdmin from "./components/UiAdmin";
import * as uiCommandsCell from "./components/UiCommandsCell";
import * as htmlarea from "./components/Htmlarea";
import * as uiTomSelect from "./components/UiTomSelect";
import { MuWidget } from "mu-widget/lib/MuWidget";

export const allMuwAdminComponents = {
    ...uiAdmin,
    ...uiCommandsCell,
    ...htmlarea,
    ...uiTomSelect,
}

export const registerMuwAdminComponents = (muWidget: typeof MuWidget) => {
    muWidget.registerAll(allMuwAdminComponents);
}