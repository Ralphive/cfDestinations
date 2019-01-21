# cfDestinations 
[![SAP](https://i.imgur.com/kkQTp3m.png)](https://cloudplatform.sap.com)

This is a sample step by step guide showing how to deploy a Cloud Foundry NodeJS application that:
1. Connect to an SAP Business One and/or SAP Business ByDesign environment
2. Use the SAP Cloud Platform Cloud Foundry Destinations service from a Node.js application
[Getting started with Cloud Foundry] (https://developers.sap.com/tutorials/hcp-cf-getting-started.html). 

Full details describing how to deploy and configure this application can be found at the following blog:
https://blogs.sap.com/2018/10/16/call-sap-cloud-platform-cloud-foundry-destinations-from-your-node.js-application/

### Step 1 - Create your destinations in SCP CF

To create a destination, go the SAP Cloud Platform cockpit and navigate to your Subaccount. Then go to "Destinations" menu under "Connectivity" and press "New Destination" link.
Check for screen captures and detailed configuration parameters for B1 and ByD system in the following blog: https://blogs.sap.com/2018/10/16/call-sap-cloud-platform-cloud-foundry-destinations-from-your-node.js-application/

### Step 2 - Create the required services instances

To be able to use the Destinations service from our application we need to create an instance for each one of the services we will use:
 - Destination 
 - Connectivity
 - Authorization & Trust Management

#### Creation of the destination instance
To access the details stored in the SAP Cloud Platform Destination service we need first to create a destination instance.
Run the following command on your CLI (after connecting, please check previous section for more details):

	cf create-service destination lite destination-demo-lite
With this command you will create a service instance for the service "destination", with the service plan "lite" and the name of your destination service instance will be "destination-demo-lite" (you can of course change the name of the service instance, just remember to change it also in the following steps).

#### Creation of the connectivity instance
SAP Cloud Platform Connectivity provides a standard HTTP proxy for on-premise connectivity to be accessible by any application."Proxy host and port are available in the credentials of the bound connectivity service via the environment variable "VCAP_SERVICES". More details on how to interpret VCAP_SERVICES can "found in the"official CF documentation.

To consume the data coming from the on-premise in the application via the HTTP proxy, we need to create an SAP Cloud Platform Connectivity instance and bind it to the application. When a binding is created the application gets connectivity credentials in its"environment variables. More details about it"here.

To create the connectivity service instance please run the following command on your CLI:

	cf create-service connectivity lite connectivity-demo-lite
With this command you will create a service instance for the service "connectivity", with the service plan "lite" and the name of your connectivity service instance will be "connectivity-demo-lite" (you can of course change the name of the service instance, just remember to change it also in the subsequent steps).

#### Creation of the Authorization & Trust Management instance (aka. XSUAA)
The central identity management service for the Cloud Foundry environment manages application authorizations and the trust to identity providers.
By calling the"application, the user will be redirected to the XSUAA and will be prompt to give his credentials. It will then achieve certain checks like verifying the OAuth client, client"s scopes, user"s scopes (Scopes are permissions to access one or more resources). Assuming everything is"fine, the"user will be authenticated and the XSUAA will redirect the"browser to the application.
In a second step"the application will take the client Id and the client secret and will talk directly with the XSUAA to get an access token. Then the application will send both tokens"as HTTP header so that it can consume the backend system via the SAP Cloud Platform Connectivity.
The next step is then to create an instance for the XSUAA. 
To create the xsuaa service instance please run the following command on your CLI:

	cf create-service xsuaa application xsuaa-demo -c "{ "xsappname" : "connectivity-app-demo", "tenant-mode": "dedicated"}"
With this command you will create a service instance for the service "connectivity", with the service plan "lite" and the name of your connectivity service instance will be "connectivity-demo-lite" (you can of course change the name of the service instance, just remember to change it also in the following steps).

### Step 3 - Get the sample application 
Download/clone the full application source code from here.

### Step 4 - Adjust the manifest.yml 
The binding between the service instances we created in a previous step and your application are defined in the manifest.yml file. 
 
If you changed the names of the services instances during the create-instance operation, please change the names accordingly in the manifest.yml file.

### Step 5 - Deploy the application into your SAP Cloud Platform Cloud Foundry space
To deploy the sample application into your SAP Cloud Platform Cloud Foundry space we use the Cloud Foundry Command Line Interface (CLI) and run the following command:

	cf push --random-route
We use the push command to deploy our application to the SAP Cloud Platform Cloud Foundry environment.
We use --random-route to get a random route not only based on the name of our application and avoid collisions from different applications running on the SAP Cloud Platform with the same name.
During the deployment all required Node.js modules will be installed and the specified bindings to the service instances will be also done.
As a result of the cf push command you will get the status of your application as well as the url to your application: 


### Step 6 - Test your application
As a result of the cf push command you will get the status of your application as well as the url to your application: 

To test your application, you can run a REST API testing tool like for example Postman can call the GetByDItems and GetB1Items with the GET command.
 
 
**Note:** SAP Business ByDesign doesn't expose oData services by default. If you want to execute the GetByDItems request you need first to expose the corresponding oData services (available inside this package at models/byd/odata folder).

 



