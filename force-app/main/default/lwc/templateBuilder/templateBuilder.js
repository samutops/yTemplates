import { LightningElement } from 'lwc';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template } from 'c/templateService';

export default class TemplateBuilder extends LightningElement {

    template = new Template();

    handleBackButtonClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }

}