public with sharing class CustomTemplateDataService {
    
    private static final Integer METADATA_API_VERSION = 
        Integer.valueOf(new MetadataService.MetadataPort().endpoint_x.substringAfterLast('/'));

    public class CustomTemplateDataServiceException extends Exception { }

    @AuraEnabled
    public static List<String> getTemplates(){
        try {
            MetadataService.MetadataPort service = createService();				
		    List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();		
		    MetadataService.ListMetadataQuery queryLayout = new MetadataService.ListMetadataQuery();
		    queryLayout.type_x = 'AuraDefinitionBundle';
		    queries.add(queryLayout);		
		    MetadataService.FileProperties[] fileProperties = service.listMetadata(queries, METADATA_API_VERSION);
		
		    // Sort
		    List<String> fullNames;
		    if(fileProperties!=null) {
                fullNames = new List<String>();
			    for(MetadataService.FileProperties fileProperty : fileProperties) {
                    String fullName;
                    if (String.isNotBlank(fileProperty.namespacePrefix)) {
                        fullName = fileProperty.namespacePrefix + '__' + fileProperty.fullName;
                    } else {
                        fullName = fileProperty.fullName;
                    }
                    fullNames.add(fullName);
                }
			    fullNames.sort();
            }
            return fullNames;
		} catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String retrieveTemplate(String templateName){
        try {
            MetadataService.MetadataPort service = createService();				
            MetadataService.RetrieveRequest retrieveRequest = new MetadataService.RetrieveRequest();
            retrieveRequest.apiVersion = METADATA_API_VERSION;
            retrieveRequest.packageNames = null;
            retrieveRequest.singlePackage = true;
            retrieveRequest.specificFiles = null;
            retrieveRequest.unpackaged = new MetadataService.Package_x();
            retrieveRequest.unpackaged.types = new List<MetadataService.PackageTypeMembers>();
            MetadataService.PackageTypeMembers packageType = new MetadataService.PackageTypeMembers();
            packageType.name = 'AuraDefinitionBundle';
            packageType.members = new String[] { '', templateName };
            retrieveRequest.unpackaged.types.add(packageType);
            return JSON.serialize(service.retrieve(retrieveRequest));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String checkAsyncRequest(String asyncResultId){
        try {
		    MetadataService.MetadataPort service = createService();
		    return JSON.serialize(service.checkRetrieveStatus(asyncResultId, true));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void upsertTemplate(String auraBundleJSON){
        System.debug(auraBundleJSON);
        try {
            MetadataService.AuraDefinitionBundle auraBundle1 = (MetadataService.AuraDefinitionBundle)JSON.deserialize(auraBundleJSON, MetadataService.AuraDefinitionBundle.class);
            
            MetadataService.AuraDefinitionBundle auraBundle = new MetadataService.AuraDefinitionBundle();
            auraBundle.fullName = auraBundle1.fullName;
            auraBundle.type_x = auraBundle1.type_x;
            auraBundle.markup = EncodingUtil.base64Encode(Blob.valueOf(auraBundle1.markup));
            auraBundle.designContent = EncodingUtil.base64Encode(Blob.valueOf(auraBundle1.designContent));
            auraBundle.documentationContent = EncodingUtil.base64Encode(Blob.valueOf(auraBundle1.documentationContent));
            System.debug(auraBundle);

            MetadataService.MetadataPort service = createService();
            List<MetadataService.UpsertResult> results = service.upsertMetadata(new MetadataService.Metadata[] { auraBundle });
            handleUpsertResults(results[0]);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static MetadataService.MetadataPort createService()
	{ 
        keepConnectionOpen();
		MetadataService.MetadataPort service = new MetadataService.MetadataPort();
		service.SessionHeader = new MetadataService.SessionHeader_element();
		service.SessionHeader.sessionId = '{!$Credential.OAuthToken}';
		return service;		
	}

    private static void handleUpsertResults(MetadataService.UpsertResult upsertResult)
    {
        if(upsertResult == null || upsertResult.success) {
            return;
        }

        if(upsertResult.errors != null) {
            List<String> messages = new List<String>();
            messages.add(
                (upsertResult.errors.size()==1 ? 'Error ' : 'Errors ') +
                    'occured processing component ' + upsertResult.fullName + '.');

            for(MetadataService.Error error : upsertResult.errors) {
                messages.add(
                    error.message + ' (' + error.statusCode + ').' +
                    ( error.fields!=null && error.fields.size()>0 ?
                        ' Fields ' + String.join(error.fields, ',') + '.' : '' ) );
            }

            if(messages.size() > 0) {
                throw new CustomTemplateDataServiceException(String.join(messages, ' '));
            }
        }

        if(!upsertResult.success) {
            throw new CustomTemplateDataServiceException('Request failed with no specified error.');
        }
    }

    private static void keepConnectionOpen() {
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:yTemplates/services/data/v56.0/limits');
        req.setMethod('GET');
        if (!Test.isRunningTest()) HttpResponse res = h.send(req);
    }

}
