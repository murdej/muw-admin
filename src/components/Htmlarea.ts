import {MuWidget} from "mu-widget/lib/MuWidget";
import {loadScript} from "mu-widget/lib/utils/utils";

export class Htmlarea extends MuWidget {
	public disabled : boolean = false;

	protected editor: any;

	public delayedInit: boolean = false;

	public uploadUrl: string|null = null;

	// @ts-ignore
	protected editorPromise: Promise<any>;

	beforeIndex() {
		this.container.innerHTML += '<div mu-id="content" class="html-area--content"></div>';
		const heValue = this.container.querySelector('input'); // 'input'
		heValue?.setAttribute('mu-id', 'value');
		// heValue.style.display = "none";
		this.container.classList.add('html-area');
	}

	afterIndex() {
		if (this.delayedInit)
			this.muParent?.muOnAfterIndex.push(() => this.initCKEditor());
		else
			this.initCKEditor();
	}

	initCKEditor() {
		if (this.ui.value) this.ui.content.innerHTML = this.ui.value.value;
		if (this.ui.placeholder) {
			this.ui.placeholder.innerHTML = '';
		}
		if (!this.disabled) {
			const updateContent = (html: string) => {
				if (this.ui.value) this.ui.value.value = html;
			}
			// @ts-ignore
			// @ts-ignore
			this.editorPromise = (async () => {
				await loadScript('/cke/ckeditor.js');
				// @ts-ignore
				return InlineEditor
					.create(this.ui.content, {
						licenseKey: '',
						// plugins: [ 'SimpleUploadAdapter' ],
						simpleUpload: {
							// The URL that the images are uploaded to.
							uploadUrl: this.uploadUrl ?? '/cke-upload',
						},
						toolbar: {
							items: [
								"heading", "|", "bold", "italic", 'strikethrough', 'underline', "link", "bulletedList", "numberedList",
								"|", "outdent", "indent",
								"|", "imageUpload", "blockQuote", "insertTable", "mediaEmbed", "code", "codeBlock", "horizontalLine",
								"|", "fontColor", "highlight", "fontSize", "|", "undo", "redo"
							]
						},

						resize_minHeight: 200
					})
					.then((editor: CKEditor) => {
						editor.model.document.on('change:data', (evt: any, data: any) => updateContent(editor.getData()));
						editor.ui.focusTracker.on('change:isFocused', (evt: any, name: any, isFocused: any) => updateContent(editor.getData()));
						this.editor = editor;
					})
					.catch((editor: CKEditor) => {
						console.error('Oops, something went wrong!');
						console.error('Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:');
						console.warn('Build id: w19cfme1zfn4-77un9p80tfp5');
						// @ts-ignore
						console.error(error);
					});
			})();
		}
	}

	// @ts-ignore
	private initValue: string;

	muBindData(srcData: any) {
		this.initValue = srcData;
		const doBindData = () => this.editor.setData(srcData || "");
		if (this.editor) doBindData();
		else this.editorPromise.then(() => doBindData()) ;
	}

	muFetchData(): any {
		return this.editor ? this.editor.getData() : this.initValue;
	}

	focus() {
		this.ui.content.focus();
		if (this.editorPromise != null) {
			this.editorPromise.then(() => this.editor.focus());

		}
	}
}

export type CKEditor = any;