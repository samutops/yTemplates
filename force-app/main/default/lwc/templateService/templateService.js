class Template {
    fullName;
    label;
    description;
    apiVersion;

    implements; // lightning:appHomeTemplate, lightning:homeTemplate, lightning:recordHomeTemplate
    regions;
    supportedFormFactors;

    constructor(json){
        Object.assign(this, json);
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
        let auraComponent = document.createElement("aura:component");
        auraComponent.setAttribute("implements",this.implements);
        auraComponent.setAttribute("description",this.description);
        console.log(auraComponent.outerHTML);

        this.regions.forEach(region => {
            let regionComponent = document.createElement("aura:attribute");
            regionComponent.setAttribute("name",region.name);
            regionComponent.setAttribute("type","Aura.Component[]");
            auraComponent.appendChild(regionComponent);
        });

        let lightningLayout = document.createElement("lightning:layout");
        this.regions.forEach(region => {
            let lightningLayoutItem = document.createElement("lightning:layoutItem");
            if (region.flexibility) {
                lightningLayoutItem.setAttribute("flexibility",region.flexibility);
            }
            if (region.size) {
                lightningLayoutItem.setAttribute("size",region.size);
            }
            if (region.class) {
                lightningLayoutItem.setAttribute("class",region.class);
            }
            lightningLayoutItem.innerHTML = `{!v.${region.name}}`;
            lightningLayout.appendChild(lightningLayoutItem);
        });
        auraComponent.appendChild(lightningLayout);

        return auraComponent.outerHTML;
    }

    getDesign() {
        let designComponent = document.createElement("design:component");
        designComponent.setAttribute("label",this.label);

        let flexipageTemplate = document.createElement("flexipage:template");
        this.regions.forEach(region => {
            let flexipageRegion = document.createElement("flexipage:region");
            flexipageRegion.setAttribute("name",region.name);
            flexipageRegion.setAttribute("label",region.label);
            flexipageRegion.setAttribute("defaultWidth",region.defaultWidth);

            if (region.hasOwnProperty("formFactor")) {
                let flexipageFormFactor = document.createElement("flexipage:formfactor");
                flexipageFormFactor.setAttribute("type",region.formFactor.type);
                flexipageFormFactor.setAttribute("width",region.formFactor.width);
                flexipageRegion.appendChild(flexipageFormFactor);
            }

            flexipageTemplate.appendChild(flexipageRegion);
        });
        designComponent.appendChild(flexipageTemplate);

        let designSupportedFormFactors = document.createElement("design:supportedFormFactors");
        this.supportedFormFactors.forEach(formFactor => {
            let designSupportedFormFactor = document.createElement("design:supportedFormFactor");
            designSupportedFormFactor.setAttribute("type",formFactor.type);
            designSupportedFormFactors.appendChild(designSupportedFormFactor);
        });
        designComponent.appendChild(designSupportedFormFactors);

        return designComponent.outerHTML;
    }

    getDocumentation() {
        return JSON.stringify(this);
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