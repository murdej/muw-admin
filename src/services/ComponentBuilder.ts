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
                result += `<div class="form-group">`;
                if (field.type === "checkbox") {
                    result += `<div class="form-check">
                      <input class="form-check-input" type="checkbox" mu="${field.name}#${field.name}">
                      <label class="form-check-label" mu-for="${field.name}">${field.label}</label>
                    </div>`;
                } else {
                    result += `<label mu-for="${field.name}">${field.label}</label>`;
                    switch (field.type) {
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
                        case "json-text":
                            result += `<textarea class="form-control tt" mu="${field.name}#${field.name}|jsonStringify::value|jsonParse" rows="10"></textarea>`;
                            break;
                    }
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
            attrs.class = this.joinCssClasses(buttonDef.cssClass || (buttonDef.label ? 'btn btn-link' : 'cursor-pointer'));
            if (buttonDef.icon) attrs.class += ' ' + this.getClassName('iconPrefix') + (buttonDef.label ? 'before-' : '') + buttonDef.icon;
            if (buttonDef.title) attrs.title = buttonDef.title;
            if (buttonDef.command) attrs['mu-click'] = 'command: ' + buttonDef.command;
            res += makeHtmlElement(
                'span',
                attrs,
                buttonDef.label
            ).outerHTML;
        }

        return res;
    }

    buildCheckboxList(values: Record<string, string>|string[]|{label:string,value:string|number}[]): string
    {
        if (!Array.isArray(values)) {
            values = Object.entries(values)
                .map(([value, label]) => ({ value, label }))
        } else {
            let v = 0;
            values = values.map(
                label => (
                    typeof label === 'string'
                    ? {
                        label,
                        value: v++
                    }
                    : label
                )
            )
        }

        return values.map((item:{label:string,value:string|number}) =>
            `<div class="form-check form-check-inline">
                <label><input type="checkbox" value="${item.value}" /> ${item.label}</label>
            </div>`
        ).join('');
    }

    getClassName(name: ComponentClassNames): string
    {
        return this.classNames[name] ?? ComponentBuilder.classNames[name] ?? '';
    }

    protected joinCssClasses(cssClasses: string|string[]) {
        return Array.isArray(cssClasses) ? cssClasses.join(' ') : cssClasses;
    }

    public static classNames: Record<ComponentClassNames, string> = {
        iconPrefix: 'icon-',
    };

    public classNames: Partial<Record<ComponentClassNames, string>> = {};
}

export type ComponentClassNames = "iconPrefix";