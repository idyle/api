# [idyle/api](https://api.idyle.app)

idyle's Application Programming Interface (API) powering its services and applications.

## Usage

idyle's API is accessible via `https://api.idyle.app`. 

The API is used by idyle's app. All registered users can also interact with the API directly by retreiving their `Access Token` by visting the Accounts section of the [idyle.app](https://idyle.app/accounts) website.

This API has a standard **IP-based rate limit**. There is also a **user-based rate limit** based on the user's plan. [Check your plan on the Payments section to find out.](https://idyle.app/payments)

### Example

```js
const request = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer YOUR_TOKEN_HERE`
            },
        };
        const url = 'https://api.idyle.app/users/get/user/user';
        const request = await fetch(url, options);
        const response = await request.json();
        return response;
};
```

### Notes

* At this time, most requests will come in the form of a `POST` method. 
* The API will also only accept the `Access Token` as a valid form of authentication. 
* Future updates should address these limitations, including method standardization, key-based authentication, among others.

### Structure

The API is divided into six middlewares that correspond to each of idyle's services. These are namely:

1. Users
2. Payments
3. Editor
4. Deployer
5. Objects
6. Documents

As such, they may be accessed through the following pattern below.

`https://api.idyle.app/{service}/...`

## Users

`https://api.idyle.app/users`

### /generate `POST`

Generates a long-lived session token.

`RETURNS` Long-lived session token string. 

###  /verify `POST`

Verifies whether a credential is valid or not.

`RETURNS` True or false boolean.

###  /revoke `POST`

Revokes a short-lived access or long-lived session token. 

`RETURNS` True or false boolean.

###  /user/{user} `POST`

Gets user data based on the user id. Entering in **user** retrieves the data of the calling user.

`REQUIRES` A valid User ID.

`RETURNS` User data object.

## Payments

`https://api.idyle.app/payments`

### /checkout/{plan} `POST`

Generates a checkout link for a specified plan based on an ID.

`REQUIRES` A valid plan ID

`RETURNS` A checkout link.

### /confirm/{session} `POST`

Confirms a completed purchase for a plan based on an ID

`REQUIRES` A valid session ID

`RETURNS` True or false boolean.

### /cancel/{subscription} `POST`

Cancels an active subscription based on an iD.

`REQUIRES` A valid subscription ID

`RETURNS` True or false boolean.

### /metrics `POST`

Gets metrics data for a user based on usage.

`RETURNS` User metrics data object.

## Editor

`https://api.idyle.app/editor`

###  /save/{path}/{id} `POST`

Creates or updates page data. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` Page ID string.

###  /get/{path}/{id} `POST`

Gets a page. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` Page data object.

###  /list/{path} `POST`

Lists all pages. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path. 

`RETURNS` Array of page data objects.

###  /delete/{path}/{id} `POST`

Gets a page. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` True or false boolean.

### /convert/{path}/{id}?type={}&output={} `POST`

Converts editor or document data into an HTML file. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`ACCEPTS` Query "type" with value "custom". In this case, the id parameter should be a valid document ID. Query "output" with value "string".

`RETURNS` Path of the HTML file. If output=string query is specified, HTML string is returned instead. 

### /batchconvert/{path}?output={} `POST`

Converts all editor data into an HTML file in bulk. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`ACCEPTS` Query "output" with value "string".

`RETURNS` True or false boolean. If output=string query is specified, an array of HTML strings is returned. 

## Deployer

`https://api.idyle.app/deployer`

### /setup/{website} `POST`

Sets up a user's website.

`REQUIRES` A valid website name.

`RETURNS` True or false boolean.

### /deploy/{website} `POST`

Makes a deploy to an existing website.

`REQUIRES` An existing website name.

`RETURNS` Deploy ID and timestamp of completion

### /get `POST`

Gets the data of an existing website.

`RETURNS` Website data object.

### /list `POST`

Lists all created deploys.

`RETURNS` An array of deploy objects.

### /connect/{domain} `POST`

Connects a custom domain to an existing website.

`REQUIRES` A valid domain name.

`RETURNS` True or false boolean.

### /disconnect `POST`

Disconnects an existing custom domain attached to a website. 

`RETURNS` True or false boolean.

## Objects

`https://api.idyle.app/objects`

### /upload/{folder}/{file} `POST`

Uploads a file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` File object.

### /delete/{folder}/{file} `POST`

Deletes a file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` True or false boolean.

### /download/{folder}/{file} `POST`

Downloads a file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` File in the form of a buffer.

### /get/{folder}/{file} `POST`

Gets file metadata. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` File metadata in form of an object.

### /public/{folder}/{file} `POST`

Makes a file publicly accessible. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` True or false boolean.

### /list/{folder} `POST`

Lists all file names. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name.

`RETURNS` Array of file names.

### /archive/{folder} `POST`

Archives a folder and uploads a compressed zipped file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name.

`RETURNS` True or false boolean.

## Documents

`https://api.idyle.app/documents`

### /insert/{collection}/{id} `POST`

Inserts a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### /update/{collection}/{id} `POST`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### /set/{collection}/{id} `POST`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### /delete/{collection}/{id} `POST`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### /get/{collection}/{id} `POST`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` JSON document object.

### /list/{collection} `POST`

Lists all documents. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` Array of document objects.