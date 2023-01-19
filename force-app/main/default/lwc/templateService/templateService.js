class Template {
    fullName;
    label;
    description;
    apiVersion;

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

                auraComponent += '<lightning:layout>';
                this.regions.forEach(region => {
                    auraComponent += `<lightning:layoutItem flexibility="${region.flexibility}" size="${region.size}" class="${region.class}">`;
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

                    if (region.hasOwnProperty("formFactor")) {
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
    defaultWidth; // SMALL, MEDIUM, LARGE
    flexibility;
    size;
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