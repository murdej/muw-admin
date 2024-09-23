import {ButtonDef, FieldDef} from "../adminTypes";
import {makeHtmlElement} from "mu-widget/lib/utils/utils";


export class ComponentBuilder {
    buildFormFields(fields: FieldDef[]): string
    {
        let result: string = '';
        for (const field of fields) {
            if (typeof field === 'string') {
                result += field;
            } else {
                const classList = [
                    'form-group',
                    ...(typeof field.colSize === "string" ? [field.colSize] : field.colSize)?.map(s => 'col-') ?? []
                ];
                result += `
                    <div class="form-group">
                        <label mu-for="${field.name}">${field.label}</label>`;
                switch(field.type) {
                    case "text":
                    case "number":
                    case "email":
                    case "tel":
                    case "url":
                        result += `<input type="${field.type}" class="form-control" mu="${field.name}#${field.name}" />`;
                        break;
                    case "select":
                        result += `<select type="${field.type}" class="form-select" mu="${field.name}#${field.name};${field.name}Options:@options"></select>`;
                        break;
                    case "html":
                        result += `<div type="${field.type}" mu="${field.name}:Htmlarea#${field.name}"></div>`;
                        break;
                }
                result += '</div>';
            }
        }

        return result;
    }

    buildTableCommands(buttonDefs: ButtonDef[]): string
    {
        let res = "";
        for (const buttonDef of buttonDefs) {
            const attrs: any = {};
            if (buttonDef.mu) attrs.mu = buttonDef.mu;
            attrs.class = this.joinCssClasses(buttonDef.cssClass || 'btn btn-link');
            if (buttonDef.command) attrs['mu-click'] = 'command: ' + buttonDef.command;
            res += makeHtmlElement(
                'span',
                attrs,
                buttonDef.label
            ).outerHTML;
        }

        return res;
    }

    protected joinCssClasses(cssClasses: string|string[]) {
        return Array.isArray(cssClasses) ? cssClasses.join(' ') : cssClasses;
    }
}