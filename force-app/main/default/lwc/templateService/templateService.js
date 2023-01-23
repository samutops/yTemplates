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

                auraComponent += "<lightning:layout";
                if (this.horizontalAlign) auraComponent += ` horizontalAlign="${this.horizontalAlign}"`;
                if (this.verticalAlign) auraComponent += ` verticalAlign="${this.verticalAlign}"`;
                if (this.pullToBoundary) auraComponent += ` pullToBoundary="${this.pullToBoundary}"`;
                if (this.multipleRows) auraComponent += ` multipleRows="${this.multipleRows}"`;
                auraComponent += ">";

                this.regions.forEach(region => {
                    auraComponent += "<lightning:layoutItem";
                    if (region.alignmentBump) auraComponent += ` alignmentBump="${region.alignmentBump}"`;
                    if (region.flexibility) auraComponent += ` flexibility="${region.flexibility}"`;
                    if (region.size) auraComponent += ` size="${region.size}"`;
                    if (region.smallDeviceSize) auraComponent += ` smallDeviceSize="${region.smallDeviceSize}"`;
                    if (region.mediumDeviceSize) auraComponent += ` mediumDeviceSize="${region.mediumDeviceSize}"`;
                    if (region.largeDeviceSize) auraComponent += ` largeDeviceSize="${region.largeDeviceSize}"`;
                    if (region.padding) auraComponent += ` padding="${region.padding}"`;
                    if (region.class) auraComponent += ` class="${region.class}"`;
                    auraComponent += ">";
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
                    if (region.formFactors && region.formFactors.length > 0) {
                        region.formFactors.forEach(formFactor => {
                            designComponent += `<flexipage:formfactor type="${formFactor.type}" width="${formFactor.width}" />`;
                        });
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
    id;
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
    formFactors;

    constructor(){
        this.formFactors = [];
    }
};

class FormFactor {
    type; // Small, Medium, Large
    width; // Small, Medium, Large, Xlarge

    setType = (type) => {
        this.type = type;
        return this;
    }
};

export {
    Template,
    Region,
    FormFactor
}