import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import retrieveTemplate from '@salesforce/apex/CustomTemplateDataService.retrieveTemplate';
import checkAsyncRequest from '@salesforce/apex/CustomTemplateDataService.checkAsyncRequest';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template } from 'c/templateService';

export default class TemplateBuilder extends LightningElement {

    @track template = new Template();
    asyncResult;
    retrieveResult;
    pollTimer;
    isLoading = false;

    templateLabel;
    templateIsMissingRequiredFields = true;

    screen = 'create';

    get templateName() {
        return null;
    }

    @api
    set templateName(value) {
        if (value) {
            this.screen = 'edit';
            this.isLoading = true;
            retrieveTemplate({ templateName: value })
                .then((result) => {
                    this.asyncResult = JSON.parse(result);
                    console.log(JSON.stringify(this.asyncResult));

                    this.pollTimer = setInterval(() => {
                        this.getAsyncResult();
                    }, 5000);
                })
                .catch((error) => {
                    console.log(JSON.stringify(error));
                    this.isLoading = false;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error Loading Template',
                        message: error.body.message,
                        variant: 'error'
                    }));
                });
        }
    }

    getAsyncResult() {
        checkAsyncRequest({ asyncResultId: this.asyncResult.id })
            .then((result) => {
                this.retrieveResult = JSON.parse(result);
                console.log('Processing asyncResult...', JSON.stringify(this.retrieveResult));
                if (this.retrieveResult.done === true) {
                    clearInterval(this.pollTimer);
                    this.loadZip(this.retrieveResult.zipFile);
                }
            })
            .catch((error) => {
                console.log('Error processing asyncResult...', JSON.stringify(error));
                clearInterval(this.pollTimer);
                this.isLoading = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Loading Template',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    handleBackButtonClick() {
        clearInterval(this.pollTimer);
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value ? event.target.value : null;

        switch (field) {
            case 'templateName':
                this.template.fullName = value;
                break;
            case 'templateLabel':
                this.template.label = value;
                this.templateLabel = value;
                break;
            case 'templateDescription':
                this.template.description = value;
                break;
            case 'templateImplements':
                this.template.implements = event.detail.value;
                break;
            default:
                break;
        }

        this.templateIsMissingRequiredFields = !this.template.hasRequiredFields();
    }

    handleCreateButtonClick() {
        upsertTemplate({ auraBundleJSON: this.template.toMetadata() })
            .then((result) => {
                this.screen = 'edit';
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Template Created Successfully!',
                    variant: 'success'
                }));
            })
            .catch((error) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Creating Template',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    loadZip(zipFile) {
        
        let newZip = new JSZip();
        newZip
            .loadAsync(zipFile, { base64: true })
            .then((zip) => {
                Object.keys(zip.files).forEach((filename) => {
                    if (filename.endsWith('.auradoc')) {
                        zip.files[filename].async("uint8array").then((fileData) => {
                            // Convert UInt8Array into Text
                            let decoder = new TextDecoder('utf8');
                            let decodedFileData = decoder.decode(fileData);

                            // Remove line breaks
                            decodedFileData = decodedFileData.replace(/[\n\r]/g, '');

                            // Insert into html tag to remove unwanted xml tags
                            let el = document.createElement('span');
                            el.innerHTML = decodedFileData;

                            // Parse JSON
                            this.template = new Template(JSON.parse(el.innerHTML));
                            console.log(JSON.parse(JSON.stringify(this.template)));
                            this.isLoading = false;
                        });
                    }
                });
            })
            .catch((error) => {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: "File fetching problem",
                        variant: "error",
                        mode: "pester"
                    })
                );
                console.log('error', error);
            });
    }

    get templateImplementationOptions() {
        return [
            { label: 'Record Page', value: 'lightning:recordHomeTemplate' },
            { label: 'App Page', value: 'lightning:appHomeTemplate' },
            { label: 'Home Page', value: 'lightning:homeTemplate' }
        ];
    }

    get screenIsCreate() {
        return this.screen == 'create';
    }

    get screenIsEdit() {
        return this.screen == 'edit';
    }

}