import { LightningElement, track } from 'lwc';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template } from 'c/templateService';

export default class TemplateBuilder extends LightningElement {

    @track template = new Template();
    templateLabel;

    templateStatus = 'new';
    screen = 'create';

    handleBackButtonClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value ? event.target.value : null;

        switch (field) {
            case 'templateLabel':
                this.template.label = value;
                this.templateLabel = value;
                break;
            case 'templateDescription':
                this.template.description = value;
                break;
            case 'templateImplementation':
                this.template.implementation = value;
                break;
            default:
                break;
        }
    }

    handleSaveButtonClick() {
        this.screen = 'edit';
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