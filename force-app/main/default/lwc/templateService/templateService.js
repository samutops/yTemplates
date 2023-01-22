class Template {
    fullName;
    label;
    description;
    apiVersion;

    horizontalAlign; // center, space, spread, end
    verticalAlign; // start, center, end, stretch
    pullToBoundary; // small, medium, large
    multipleRows; // true, false

    implements; // lightning:appHomeTemplate, lightning:homeTemplate, lightning:recordHomeTemplate
    regions;
    supportedFormFactors;

    constructor(json){
        if (json) {
            Object.assign(this, json);
        } else {
            this.apiVersion = '56.0';
            this.regions = [];
            this.supportedFormFactors = [];
        }
    }

    hasRequiredFields = () => {
        if (this.fullName && this.label && this.description && this.implements) {
            return true;
        }
        return false;
    }

    toMetadata = () => {
        return JSON.stringify({
            type: 'AuraDefinitionBundle',
            type_x: 'Component',
            fullName: this.fullName,
            description: this.description,
            apiVersion: this.apiVersion,
            markup: this.getMarkup(),
            designContent: this.getDesign(),
            documentationContent: this.getDocumentation()
        });
    }

    getMarkup() {
        let auraComponent = `<aura:component implements="${this.implements}" description="${this.description}">`;

            if (this.regions.length > 0) {
                this.regions.forEach(region => {
                    auraComponent += `<aura:attribute name="${region.name}" type="Aura.Component[]" />`;
                });

                auraComponent += `<lightning:layout horizontalAlign="${this.horizontalAlign || ''}" verticalAlign="${this.verticalAlign || ''}" pullToBoundary="${this.pullToBoundary || ''}" multipleRows="${this.multipleRows || ''}">`;
                this.regions.forEach(region => {
                    auraComponent += `<lightning:layoutItem alignmentBump="${region.alignmentBump || ''}" flexibility="${region.flexibility || ''}" size="${region.size || ''}" smallDeviceSize="${region.smallDeviceSize || ''}" mediumDeviceSize="${region.mediumDeviceSize || ''}" largeDeviceSize="${region.largeDeviceSize || ''}" padding="${region.padding || ''}" class="${region.class || ''}">`;
                        auraComponent += `{!v.${region.name}}`;
                    auraComponent += '</lightning:layoutItem>';
                });
                auraComponent += '</lightning:layout>';
            }

        auraComponent += '</aura:component>';
        return auraComponent;
    }

    getDesign() {
        let designComponent = `<design:component label="${this.label}">`;

            if (this.regions.length > 0) {
                designComponent += '<flexipage:template>';
                this.regions.forEach(region => {
                    designComponent += `<flexipage:region name="${region.name}" label="${region.label}" defaultWidth="${region.defaultWidth}">`;
                    if (region.hasOwnProperty("formFactor") && region.formFactor) {
                        designComponent += `<flexipage:formfactor type="${region.formFactor.type}" width="${region.formFactor.width}" />`;
                    }
                    designComponent += '</flexipage:region>';
                });
                designComponent += '</flexipage:template>';
            }
            if (this.supportedFormFactors.length > 0) {
                designComponent += '<design:supportedFormFactors>';
                this.supportedFormFactors.forEach(formFactor => {
                    designComponent += `<design:supportedFormFactor type="${formFactor.type}" />`;
                });
                designComponent += '</design:supportedFormFactors>';
            }

        designComponent += '</design:component>';
        return designComponent;
    }

    getDocumentation() {
        let documentationComponent = '<aura:documentation>';
            documentationComponent += '<aura:description>';
                documentationComponent += JSON.stringify(this);
            documentationComponent += '</aura:description>';
        documentationComponent += '</aura:documentation>';
        return documentationComponent;
    }
};

class Region {
    name;
    label;
    defaultWidth; // Small, Medium, Large
    flexibility; // auto, shrink, no-shrink, grow, no-grow, no-flex
    padding; // horizontal-small, horizontal-medium, horizontal-large, around-small, around-medium, around-large
    alignmentBump; // left, top, right, bottom
    size;
    smallDeviceSize;
    mediumDeviceSize;
    largeDeviceSize;
    class;
    formFactor;
};

class FormFactor {
    type; // Small, Large
    width; // Small, Medium, Large, Xlarge
};

export {
    Template,
    Region,
    FormFactor
}