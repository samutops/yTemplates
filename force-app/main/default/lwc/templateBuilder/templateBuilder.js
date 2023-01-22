import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import retrieveTemplate from '@salesforce/apex/CustomTemplateDataService.retrieveTemplate';
import checkAsyncRequest from '@salesforce/apex/CustomTemplateDataService.checkAsyncRequest';
import upsertTemplate from '@salesforce/apex/CustomTemplateDataService.upsertTemplate';
import { Template, Region, FormFactor } from 'c/templateService';

export default class TemplateBuilder extends LightningElement {

    @track template = new Template();
    asyncResult;
    retrieveResult;
    pollTimer;
    isLoading = false;

    templateLabel;
    templateIsMissingRequiredFields = true;

    // Region
    regions = [];
    selectedRegionName;
    selectedRegion;
    isCreatingRegion = false;

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
                this.templateLabel = value;
                break;
            case 'templateDescription':
                this.template.description = value;
                break;
            case 'templateImplements':
                this.template.implements = picklistValue;
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
                this.template.implements = checkboxValue;
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

        this.templateIsMissingRequiredFields = !this.template.hasRequiredFields();
    }

    handleCreateButtonClick() {
        this.template.regions = this.regions;
        console.log(this.template.toMetadata());

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

    handleOnRegionSelect(event) {
        const regionName = event.detail.name || event.currentTarget.dataset.regionName;
        if (regionName) {
            this.selectedRegionName = regionName;
            this.selectedRegion = this.regions.find(region => region.name == this.selectedRegionName);
        }
    }

    handleAddRegionButtonClick(event) {
        this.selectedRegion = new Region();
        this.isCreatingRegion = true;
    }

    handleCancelAddRegionButtonClick() {
        this.selectedRegionName = undefined;
        this.selectedRegion = undefined;
        this.isCreatingRegion = false;
    }

    handleSaveRegionButtonClick() {
        const newRegions = Array.from(this.regions);
        if (!this.regions.some(region => region.name == this.selectedRegion.name)) {
            newRegions.push(this.selectedRegion);
        }
        this.regions = newRegions;
        this.selectedRegionName = undefined;
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

    get templateImplementationOptions() {
        return [
            { label: 'Record Page', value: 'lightning:recordHomeTemplate' },
            { label: 'App Page', value: 'lightning:appHomeTemplate' },
            { label: 'Home Page', value: 'lightning:homeTemplate' }
        ];
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
            { label: 'Auto', value: 'auto' },
            { label: 'Shrink', value: 'shrink' },
            { label: 'No Shrink', value: 'no-shrink' },
            { label: 'Grow', value: 'grow' },
            { label: 'No Grow', value: 'no-grow' },
            { label: 'No Flex', value: 'no-flex' }
        ];
    }

    get templateHorizontalAlignmentOptions() {
        return [
            { label: 'Center', value: 'center' },
            { label: 'Space', value: 'space' },
            { label: 'Spread', value: 'spread' },
            { label: 'End', value: 'end' }
        ];
    }

    get templateVerticalAlignmentOptions() {
        return [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' }
        ];
    }

    get templatePullToBoundaryOptions() {
        return [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
        ];
    }

    get templateAlignmentBumpOptions() {
        return [
            { label: 'Left', value: 'left' },
            { label: 'Top', value: 'top' },
            { label: 'Right', value: 'right' },
            { label: 'Bottom', value: 'bottom' }
        ];
    }

    get templatePaddingOptions() {
        return [
            { label: 'Horizontal Small', value: 'horizontal-small' },
            { label: 'Horizontal Medium', value: 'horizontal-medium' },
            { label: 'Horizontal Large', value: 'horizontal-large' },
            { label: 'Around Small', value: 'around-small' },
            { label: 'Around Medium', value: 'around-medium' },
            { label: 'Around Large', value: 'around-large' }
        ];
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