import { LightningElement, wire } from 'lwc';
import retrieveTemplate from '@salesforce/apex/CustomTemplateDataService.retrieveTemplate';
import checkAsyncRequest from '@salesforce/apex/CustomTemplateDataService.checkAsyncRequest';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template } from 'c/templateService';

export default class LoadTemplateExample extends LightningElement {

    template;
    asyncResult;
    retrieveResult;

    handleGetTemplateClick() {
        retrieveTemplate({ templateName: 'yTemplates__CustomTemplate' })
            .then((result) => {
                this.asyncResult = JSON.parse(result);
                console.log(JSON.stringify(this.asyncResult));
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
            });
    }

    handleGetAsyncResultClick() {
        checkAsyncRequest({ asyncResultId: this.asyncResult.id })
            .then((result) => {
                this.retrieveResult = JSON.parse(result);
                if (this.retrieveResult.done === true) {
                    this.loadZip(this.retrieveResult.zipFile);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
            });
    }

    handleToMetadataClick() {
        let componentMetadata = this.template.toMetadata();
        console.log(JSON.parse(componentMetadata));
    }

    handleUpsertTemplateClick() {
        upsertTemplate({ auraBundleJSON: this.template.toMetadata() })
            .then((result) => {
                console.log('All good!');
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
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
                        });
                    }
                });
            })
            .catch((error) => {
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

}