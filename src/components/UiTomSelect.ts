import TomSelect from "tom-select";
import {TomSettings} from "tom-select/src/types";
import {TomCreate, TomLoadCallback} from "tom-select/dist/types/types";
import {MuWidget} from "mu-widget/lib/MuWidget";
import {arrayDiff} from "mu-widget/lib/utils/utils";
import {TypeFromOptional} from "../adminTypes";


export class UiTomSelect extends MuWidget
{
	public maxItems: number|null = null;
	public valueField: string = "id";
	public labelField: string = "name";
	public searchField: string[] = [];
	// @ts-ignore
	public tom: TomSelect;
	public optionLoader: ((escapeQuery: string|string[], callback:TomLoadCallback)=>void)|null = null;
	public missingOptionLoader: ((ids: string[], callback:TomLoadCallback)=>void)|null = null;
	public canCreate: boolean | TomCreate = false;
	public newValuePrefix: string = "*";
	private disableEvents: boolean = false;
	public emptyLabel: string|null = "";

	public get value() {
		return this.tom?.getValue();
	}

	public set value(v) {
		this.tom.setValue(v);
	}

	public get valueOption(): any|null {
		const v = this.value;
		// @ts-ignore
		return v ? this.tom.options[v] : null;
	}

	muFetchData(): any {
		this.autoinit();
		return this.value;
	}

	protected oldValue: string = "";
	protected fireEvent() {
		const newValue = JSON.stringify(this.value);
		if (this.oldValue !== newValue) {
			this.oldValue = newValue;
			if (!this.disableEvents) {
				this.muDispatchEvent("changeValue", {
					selector: this,
					option: this.valueOption,
					value: newValue,
				});
			}
		}
	}

	async muBindData(data: any): Promise<any> {
		this.autoinit();
		const oldValue = this.getValue();

		if (this.multiple) {
			if (data) {
				let value: any[] = [];
				for (const v of data) {
					if (!v || ['string', 'number'].includes(typeof v)) value.push(v);
					else {
						this.tom.addOption(v);
						value.push(v[this.valueField]);
					}
				}
				if (value.length) {
					const existsIds = Object.keys(this.tom.options);
					value = value.map(v => v.toString());
					const missing = arrayDiff(value, existsIds);
					if (missing.length) {
						const loader = this.missingOptionLoader || this.optionLoader;
						if (loader) {
							loader(missing, newOptions => {
								this.replaceOptions(newOptions);
								this.value = value;
								this.fireEvent();
							});
						} else this.fireEvent();
					} else {
						this.value = value;
						this.fireEvent();
					}
				} else {
					this.value = [];
					this.fireEvent();
				}
			} else {
				this.value = [];
				this.fireEvent();
			}
		} else {
			if (!data || ['string', 'number'].includes(typeof data)) {
				const val = data;
				if (!val) {

				} else if (!this.tom.options[val]) {
					this.tom.addOption({
						[this.valueField]: val,
						[this.labelField]: "... " + val,
					});
					const loader = this.missingOptionLoader || this.optionLoader;
					if (loader) {
						loader([val], newOptions => {
							this.replaceOptions(newOptions);
							this.fireEvent();
						});
					} else this.fireEvent();
				} else this.fireEvent();
				this.value = val;
			} else {
				this.replaceOption(data);
				this.value = data[this.valueField];
			}
		}
	}

	public bindItems(items: any[]|Record<string, string | any>, removeExists = false) {
		this.autoinit();
		this.noEvents(() => {
			const oldValue = this.value;
			if (removeExists) this.tom.clearOptions();
			if (Array.isArray(items)) {
				for(const item of items)
					this.replaceOption(item);
			} else {
				for(const k in items) {
					let item = items[k];
					this.replaceOption((typeof item === "string")
						? {
							id: k,
							title: item,
						}
						: item
					);
				}
			}
			this.value = oldValue;
		});
	}

	beforeIndex() {
		this.muRegisterEvent("changeValue");
		this.container.innerHTML += '<select mu-id="input"' + (this._multiple ? " multiple" : "") + '></select>';
	}

	afterIndex() {
		// this.init();
	}

	private _multiple: boolean = false;

	set multiple(multiple: boolean) {
		this._multiple = multiple;
		if (this.ui.input) this.ui.input.multiple = multiple;
	}

	get multiple() { return this._multiple; }

	public init(initOpts: TypeFromOptional<UiTomSelect> = {}): UiTomSelect {
		for(const k in initOpts) {
			// @ts-ignore
			this[k] = initOpts[k];
		}
		const opts: Partial<TomSettings> = {
			maxItems: this.multiple ? this.maxItems : 1,
			valueField: this.valueField,
			labelField: this.labelField,
			searchField: this.searchField.length ? this.searchField : [ this.labelField ],
		};
		if (this.muTemplates.item) {
			const render = (item: any, escape: (s:string)=>string): HTMLElement => {
				const itemWidget = this.muWidgetFromTemplate("item", null, item);
				itemWidget.muBindData(item);

				return itemWidget.container as HTMLElement;
			}
			// @ts-ignore
			opts.render = {
				option: render,
				item: render,
			}
		}
		if (this.canCreate)
		{
			opts.create = true;
			//TODO: Obejít méně prasečím způsobem
			opts.onItemAdd = (v, d) => {
				const newOpt = this.tom.options[v];
				if (newOpt[this.valueField] != newOpt[this.labelField]) return;
				delete this.tom.options[v];
				const newV = this.newValuePrefix + v
				newOpt[this.valueField] = newV;
				this.tom.options[newV] = newOpt;
				this.tom.items = this.tom.items.map(iv => iv == v ? newV : iv);
			}
		}
		if ((this as any).optionLoader) opts.load = (escapeQuery: string, callback) => (this as any).optionLoader(escapeQuery, callback);
		opts.onChange = (ev) => this.fireEvent();
		if (this.tom) this.tom.destroy();
		// @ts-ignore
		this.tom = new TomSelect(this.ui.input, opts);
		return this;
	}

	public replaceOption(option: any) {
		if (this.tom.options[option[this.valueField]]) {
			this.tom.updateOption(option[this.valueField], option);
		} else {
			this.tom.addOption(option);
		}
		// this.tom.
	}

	public replaceOptions(options: any[]) {
		for(const option of options)
			this.replaceOption(option);
	}

	private autoinit() {
		if (!this.tom) this.init();
	}

	public getValue() {
		return this.muFetchData();
	}

	public setSelected(v: null|string|any) {
		return this.muBindData(v);
	}

	public setDisabled(disabled: boolean) {
		this.autoinit();
		if (disabled) this.tom.disable();
		else this.tom.enable();
	}

	private noEvents(runThis: () => void) {
		this.disableEvents = true;
		try {
			runThis();
		} finally {
			this.disableEvents = false;
		}
	}
}