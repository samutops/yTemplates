import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTemplates from '@salesforce/apex/CustomTemplateDataService.getTemplates';

export default class TemplateManager extends LightningElement {

    screen = 'menu';
    templates = [];
    selectedTemplateName;

    handleNewTemplateButtonClick() {
        this.screen = 'builder';
    }

    handleEditTemplateButtonClick() {
        getTemplates()
            .then((result) => {
                this.templates = result;
                this.screen = 'templates';
            })
            .catch((error) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Loading Templates',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    handleTemplateLinkClick(event) {
        this.selectedTemplateName = event.currentTarget.dataset.templateName;
        this.screen = 'builder';
    }

    handleClose() {
        this.screen = 'menu';
        this.selectedTemplateName = null;
    }

    get screenIsMenu() {
        return this.screen == 'menu';
    }

    get screenIsBuilder() {
        return this.screen == 'builder';
    }

    get screenIsTemplates() {
        return this.screen == 'templates';
    }

}