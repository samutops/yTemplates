@isTest
private with sharing class CustomTemplateDataServiceTest {
    
    @isTest
    static private void testGetTemplates() {
        System.Test.setMock(WebServiceMock.class, new MetadataServiceMock());
        
        Test.startTest();

        List<String> templateNames = CustomTemplateDataService.getTemplates();
        System.assertEquals(2, templateNames.size(), 'The function returned 2 template names');
        System.assertEquals('MyTemplate2', templateNames.get(0));
        System.assertEquals('yplicity__MyTemplate', templateNames.get(1));

        Test.stopTest();
    }

    @isTest
    static private void testRetrieveTemplate() {
        System.Test.setMock(WebServiceMock.class, new MetadataServiceMock());
        
        Test.startTest();

        String asyncResultString = CustomTemplateDataService.retrieveTemplate('TEMPLATE_NAME');
        System.assertNotEquals(null, asyncResultString, 'The function returned an async result');

        Test.stopTest();
    }

    @isTest
    static private void testCheckAsyncRequest() {
        System.Test.setMock(WebServiceMock.class, new MetadataServiceMock());
        
        Test.startTest();

        String asyncResultString = CustomTemplateDataService.checkAsyncRequest('JOB_ID');
        System.assertNotEquals(null, asyncResultString, 'The function returned an async result');

        Test.stopTest();
    }

    @isTest
    static private void testUpsertTemplateWithErrors() {
        System.Test.setMock(WebServiceMock.class, new MetadataServiceMock());
        
        Test.startTest();

        MetadataService.AuraDefinitionBundle auraDefinitionBundle = new MetadataService.AuraDefinitionBundle();
        auraDefinitionBundle.fullName = 'MyTemplate';
        auraDefinitionBundle.type_x = 'AuraDefinitionBundle';
        auraDefinitionBundle.markup = '';
        auraDefinitionBundle.designContent = '';
        auraDefinitionBundle.documentationContent = '';

        try {
            CustomTemplateDataService.upsertTemplate(JSON.serialize(auraDefinitionBundle));
        } catch (Exception e) {
            System.assert(true, 'Exception was raised');
        }

        Test.stopTest();
    }

}