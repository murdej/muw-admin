import {MuWidget} from "mu-widget/lib/MuWidget";

export let MuWidgetClass: typeof MuWidget = MuWidget;

export function setMuWidget(newMuWidgetClass: typeof MuWidget): void
{
    MuWidgetClass = newMuWidgetClass;
}
