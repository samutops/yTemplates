import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import retrieveTemplate from '@salesforce/apex/CustomTemplateDataService.retrieveTemplate';
import checkAsyncRequest from '@salesforce/apex/CustomTemplateDataService.checkAsyncRequest';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template, Region, FormFactor } from 'c/templateService';
import { ID_LENGTH, generateRandomString } from 'c/templateUtils';

export default class TemplateBuilder extends LightningElement {

    // Screen
    screen = 'create';

    // Loading Template
    asyncResult;
    retrieveResult;
    pollTimer;
    isLoading = false;

    // Template
    @track template = new Template();
    templateIsMissingRequiredFields = true;
    selectedSupportedFormFactors = [];

    // Region
    @track regions = [];
    @track selectedRegion;
    isCreatingRegion = false;

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

                    this.pollTimer = setInterval(() => {
                        this.getAsyncResult();
                    }, 5000);
                })
                .catch((error) => {
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
                if (this.retrieveResult.done === true) {
                    clearInterval(this.pollTimer);
                    this.loadZip(this.retrieveResult.zipFile);
                }
            })
            .catch((error) => {
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
        const picklistValue = event.detail.value;
        const checkboxValue = event.detail.checked;

        switch (field) {
            case 'templateName':
                this.template.fullName = value;
                break;
            case 'templateLabel':
                this.template.label = value;
                break;
            case 'templateDescription':
                this.template.description = value;
                break;
            case 'templateImplements':
                this.template.implements = picklistValue;
                this.selectedSupportedFormFactors = []; // The user has to select the form factors again
                break;
            case 'templateSupportedFormFactors':
                this.selectedSupportedFormFactors = picklistValue;
                break;
            case 'templateHorizontalAlign':
                this.template.horizontalAlign = picklistValue;
                break;
            case 'templateVerticalAlign':
                this.template.verticalAlign = picklistValue;
                break;
            case 'templatePullToBoundary':
                this.template.pullToBoundary = picklistValue;
                break;
            case 'templateMultipleRows':
                this.template.multipleRows = checkboxValue;
                break;
            case 'regionLabel':
                this.selectedRegion.label = value;
                break;
            case 'regionName':
                this.selectedRegion.name = value;
                break;
            case 'regionDefaultWidth':
                this.selectedRegion.defaultWidth = picklistValue;
                break;
            case 'regionFlexibility':
                this.selectedRegion.flexibility = picklistValue;
                break;
            case 'regionSize':
                this.selectedRegion.size = picklistValue;
                break;
            case 'regionSmallDeviceSize':
                this.selectedRegion.smallDeviceSize = picklistValue;
                break;
            case 'regionMediumDeviceSize':
                this.selectedRegion.mediumDeviceSize = picklistValue;
                break;
            case 'regionLargeDeviceSize':
                this.selectedRegion.largeDeviceSize = picklistValue;
                break;
            case 'regionPadding':
                this.selectedRegion.padding = picklistValue;
                break;
            case 'regionAlignmentBump':
                this.selectedRegion.alignmentBump = picklistValue;
                break;
            case 'regionClass':
                this.selectedRegion.class = value;
                break;
            default:
                break;
        }

        // Little trick so the page re-renders the changes
        this.regions = [...this.regions]; 

        this.templateIsMissingRequiredFields = !this.template.hasRequiredFields();
    }

    handleCreateTemplateButtonClick() {
        this.template.regions = this.regions;
        this.template.supportedFormFactors = this.selectedSupportedFormFactors.map(formFactorType => new FormFactor().setType(formFactorType));
        console.log(this.template.toMetadata());

        upsertTemplate({ auraBundleJSON: this.template.toMetadata() })
            .then((result) => {
                this.screen = 'edit';
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Template Saved Successfully!',
                    variant: 'success'
                }));
            })
            .catch((error) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Saving Template',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    handleOnRegionSelect(event) {
        event.stopPropagation();

        const regionName = event.detail.name;
        const regionId = event.currentTarget.dataset.regionId;
        if (regionName) {
            this.selectedRegion = this.regions.find(region => region.name == regionName);
        } else if (regionId) {
            this.selectedRegion = this.regions.find(region => region.id == regionId);
        }
    }

    handleAddRegionButtonClick(event) {
        let region = new Region();
        region.id = generateRandomString(ID_LENGTH);
        this.regions.push(region);
        this.selectedRegion = region;
        this.isCreatingRegion = true;
    }

    handleDeleteRegionButtonClick(event) {
        this.regions = this.regions.filter(region => region.id != this.selectedRegion.id);
        this.handleResetButtonClick();
    }

    handleResetButtonClick() {
        this.selectedRegion = undefined;
        this.isCreatingRegion = false;
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
                            this.selectedSupportedFormFactors = this.template.supportedFormFactors.map(formFactor => formFactor.type);
                            this.regions = this.template.regions ? this.template.regions : [];
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
            });
    }

    get sizeOptions() {
        const options = [];
        for (let i = 1; i < 13; i++) {
            options.push({ label: i.toString(), value: i.toString() });
        }
        return options;
    }

    get widthOptions() {
        return [
            { label: 'Small', value: 'Small' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Large', value: 'Large' },
            { label: 'Extra Large', value: 'Xlarge' }
        ];
    }

    get flexibilityOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Auto', value: 'auto' },
            { label: 'Shrink', value: 'shrink' },
            { label: 'No Shrink', value: 'no-shrink' },
            { label: 'Grow', value: 'grow' },
            { label: 'No Grow', value: 'no-grow' },
            { label: 'No Flex', value: 'no-flex' }
        ];
    }

    get implementationOptions() {
        return [
            { label: 'Record Page', value: 'lightning:recordHomeTemplate' },
            { label: 'App Page', value: 'lightning:appHomeTemplate' },
            { label: 'Home Page', value: 'lightning:homeTemplate' }
        ];
    }

    get horizontalAlignmentOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Center', value: 'center' },
            { label: 'Space', value: 'space' },
            { label: 'Spread', value: 'spread' },
            { label: 'End', value: 'end' }
        ];
    }

    get verticalAlignmentOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' }
        ];
    }

    get pullToBoundaryOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
        ];
    }

    get alignmentBumpOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Left', value: 'left' },
            { label: 'Top', value: 'top' },
            { label: 'Right', value: 'right' },
            { label: 'Bottom', value: 'bottom' }
        ];
    }

    get paddingOptions() {
        return [
            { label: '--- None ---', value: '' },
            { label: 'Horizontal Small', value: 'horizontal-small' },
            { label: 'Horizontal Medium', value: 'horizontal-medium' },
            { label: 'Horizontal Large', value: 'horizontal-large' },
            { label: 'Around Small', value: 'around-small' },
            { label: 'Around Medium', value: 'around-medium' },
            { label: 'Around Large', value: 'around-large' }
        ];
    }

    get supportedFormFactorsOptions() {
        let options = [];
        if (this.template.implements !== 'lightning:homeTemplate') { // Home pages support only the Large form factor
            options.push({ label: 'Small', value: 'Small' });
        }
        options.push({ label: 'Large', value: 'Large' });
        return options;
    }

    get screenIsCreate() {
        return this.screen == 'create';
    }

    get screenIsEdit() {
        return this.screen == 'edit';
    }

    get regionPanelHeader() {
        return this.isCreatingRegion ? 'New Region' : 'Selected Region';
    }

}