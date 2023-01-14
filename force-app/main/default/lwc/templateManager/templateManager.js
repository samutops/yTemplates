import { LightningElement } from 'lwc';

export default class TemplateManager extends LightningElement {

    screen = 'welcome';

    handleNewTemplateButtonClick() {
        this.screen = 'create';
    }

    handleEditTemplateButtonClick() {
        this.screen = 'edit';
    }

    handleClose() {
        this.screen = 'welcome';
    }

    get screenIsWelcome() {
        return this.screen == 'welcome';
    }

    get screenIsCreate() {
        return this.screen == 'create';
    }

    get screenIsEdit() {
        return this.screen == 'edit';
    }

}