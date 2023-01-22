import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jszip from '@salesforce/resourceUrl/jszipmin';

export default class Jszip extends LightningElement {

    connectedCallback() {
        Promise.all([
            loadScript(this, jszip + '/jszip.min.js')
        ])
            .then(() => {
                //console.log('JSZip loaded!');
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading JSZIP',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

}