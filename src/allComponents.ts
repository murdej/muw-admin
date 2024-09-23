import * as uiAdmin from "./components/UiAdmin";
import * as uiCommandsCell from "./components/UiCommandsCell";
import * as htmlarea from "./components/Htmlarea";
import * as uiTomSelect from "./components/UiTomSelect";
import { MuWidget } from "mu-widget/lib/MuWidget";
import { SideModal } from "mu-widget/lib/components/SideModal";

export const allMuwAdminComponents = {
    ...uiAdmin,
    ...uiCommandsCell,
    ...htmlarea,
    ...uiTomSelect,
}

export const registerMuwAdminComponents = (muWidget: typeof MuWidget) => {
    muWidget.registerAll(allMuwAdminComponents);
}