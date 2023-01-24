public class MetadataServiceMock implements WebServiceMock {

    public void doInvoke(
        Object stub, Object request, Map<String, Object> response,
        String endpoint, String soapAction, String requestName,
        String responseNS, String responseName, String responseType) 
    {
        if(request instanceof MetadataService.retrieve_element) {
            MetadataService.retrieve_element requestElement = (MetadataService.retrieve_element)request;
            if (requestElement.retrieveRequest != null && 
                requestElement.retrieveRequest.unpackaged != null &&
                requestElement.retrieveRequest.unpackaged.types != null) {
                if (requestElement.retrieveRequest.unpackaged.types.get(0).name == 'AuraDefinitionBundle') {
                    MetadataService.retrieveResponse_element responseElement = new MetadataService.retrieveResponse_element();
                    responseElement.result = new MetadataService.AsyncResult();
                    responseElement.result.done = false;
                    response.put('response_x', responseElement);
                }
            } else {
                response.put('response_x', new MetadataService.retrieveResponse_element());
            }
        } else if(request instanceof MetadataService.checkDeployStatus_element)
            response.put('response_x', new MetadataService.checkDeployStatusResponse_element());
        else if(request instanceof MetadataService.listMetadata_element) {
            MetadataService.listMetadata_element requestElement = (MetadataService.listMetadata_element)request;
            if (requestElement.queries != null && !requestElement.queries.isEmpty()) {
                if (requestElement.queries.get(0).type_x == 'AuraDefinitionBundle') {
                    MetadataService.FileProperties filePropertiesWithNamespacePrefix = new MetadataService.FileProperties();
                    filePropertiesWithNamespacePrefix.namespacePrefix = 'yplicity';
                    filePropertiesWithNamespacePrefix.fullName = 'MyTemplate';

                    MetadataService.FileProperties fileProperties = new MetadataService.FileProperties();
                    fileProperties.fullName = 'MyTemplate2';
                    
                    MetadataService.listMetadataResponse_element responseElement = new MetadataService.listMetadataResponse_element();
                    responseElement.result = new List<MetadataService.FileProperties>{
                        filePropertiesWithNamespacePrefix,
                        fileProperties
                    };
                    response.put('response_x', responseElement);
                }
            } else {
                response.put('response_x', new MetadataService.listMetadataResponse_element());
            }
        } else if(request instanceof MetadataService.checkRetrieveStatus_element)
            response.put('response_x', new MetadataService.checkRetrieveStatusResponse_element());
        else if(request instanceof MetadataService.describeMetadata_element)
            response.put('response_x', new MetadataService.describeMetadataResponse_element());
        else if(request instanceof MetadataService.deploy_element)
            response.put('response_x', new MetadataService.deployResponse_element());
        else if(request instanceof MetadataService.updateMetadata_element)
            response.put('response_x', new MetadataService.updateMetadataResponse_element());
        else if(request instanceof MetadataService.renameMetadata_element)
            response.put('response_x', new MetadataService.renameMetadataResponse_element());
        else if(request instanceof  MetadataService.cancelDeploy_element)
            response.put('response_x', new MetadataService.cancelDeployResponse_element());
        else if(request instanceof  MetadataService.deleteMetadata_element)
            response.put('response_x', new MetadataService.deleteMetadataResponse_element());
        else if(request instanceof  MetadataService.upsertMetadata_element) {
            MetadataService.Error error = new MetadataService.Error();
            error.message = 'error';
            error.statusCode = 'error';

            MetadataService.UpsertResult upsertResult = new MetadataService.UpsertResult();
            upsertResult.success = false;
            upsertResult.created = false;
            upsertResult.errors = new List<MetadataService.Error>{error};

            MetadataService.upsertMetadataResponse_element resultElement = new MetadataService.upsertMetadataResponse_element();
            resultElement.result = new List<MetadataService.UpsertResult>{upsertResult};
            response.put('response_x', resultElement);
        } else if(request instanceof  MetadataService.createMetadata_element)
            response.put('response_x', new MetadataService.createMetadataResponse_element());
        else if(request instanceof  MetadataService.deployRecentValidation_element)
            response.put('response_x', new MetadataService.deployRecentValidationResponse_element());
        else if(request instanceof MetadataService.describeValueType_element)
            response.put('response_x', new MetadataService.describeValueTypeResponse_element());
        else if(request instanceof MetadataService.checkRetrieveStatus_element)
            response.put('response_x', new MetadataService.checkRetrieveStatusResponse_element());
        return;
    }
}