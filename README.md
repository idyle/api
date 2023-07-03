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

### Structure

The API is divided into six middlewares that correspond to each of idyle's services. These are namely:

1. Auth
2. Payments
3. Editor
4. Deployer
5. Objects
6. Documents

As such, they may be accessed through the following pattern below.

`https://api.idyle.app/{service}/...`

## Users

`https://api.idyle.app/auth`

### /tokens

### `GET`

Verifies whether a credential is valid or not.

`RETURNS` True or false boolean.

### `POST`

Generates a long-lived session token.

`RETURNS` Long-lived session token string. 

### `DELETE`

Revokes a short-lived access or long-lived session token. 

`RETURNS` True or false boolean.

###  /users/{user} 

### `GET`

Gets user data based on the user id. Entering in **user** retrieves the data of the calling user.

`REQUIRES` A valid User ID.

`RETURNS` User data object.

### `POST`

Sets user data based on the user identifier. Entering in **user** retrieves the data of the calling user.

`ACCEPTS` Query "type" with value "email".

`REQUIRES` A valid User ID or User email.

`RETURNS` User data object.

## Payments

`https://api.idyle.app/payments`

### /plans/{id}

### `GET`

Generates a checkout link for a specified plan based on an ID.

`REQUIRES` A valid plan ID

`RETURNS` A checkout link.

### `POST`

Confirms a completed purchase for a plan based on an ID

`REQUIRES` A valid session ID

`RETURNS` True or false boolean.

### `DELETE`

Cancels an active subscription based on an iD.

`REQUIRES` A valid subscription ID

`RETURNS` True or false boolean.

### /metrics 

### `GET`

Gets metrics data for a user based on usage.

`RETURNS` User metrics data object.

## Editor

`https://api.idyle.app/editor`

### /pages/{path}

### `GET`

Lists all pages. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path. 

`RETURNS` Array of page data objects.

### `POST`

Creates a page. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path. 

`RETURNS` Page ID string.

### /pages/{path}/{id}

### `PATCH`

Updates page data. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` Page ID string.

### `GET`

Gets a page. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` Page data object.

### `DELETE`

Gets a page. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`RETURNS` True or false boolean.

### /convert/{path}/{id}?type={}&output={} 

### `POST`

Converts editor or document data into an HTML file. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`ACCEPTS` Query "type" with value "custom". In this case, the id parameter should be a valid document ID. Query "output" with value "string".

`RETURNS` Path of the HTML file. If output=string query is specified, HTML string is returned instead. 

### /batchconvert/{path}?output={} 

### `POST`

Converts all editor data into an HTML file in bulk. Entering in **user** as the path uses editor's default path.

`REQUIRES` A valid path and valid page ID. 

`ACCEPTS` Query "output" with value "string".

`RETURNS` True or false boolean. If output=string query is specified, an array of HTML strings is returned. 

## Deployer

`https://api.idyle.app/deployer`

### /websites/{website}

### `GET` 

Lists all websites 

`RETURNS` An array of website objects.

### `POST`

Sets up a user's website.

`REQUIRES` A valid website name.

`RETURNS` True or false boolean.

### /deploys/{website} 

### `GET`

Lists all created deploys.

`RETURNS` An array of deploy objects.

### `POST`

Makes a deploy to an existing website.

`REQUIRES` An existing website name.

`RETURNS` Deploy ID and timestamp of completion

### /domains/{website}/{domain}

### `POST`

Connects a custom domain to an existing website.

`REQUIRES` A valid domain name.

`RETURNS` True or false boolean.

### `DELETE`

Disconnects an existing custom domain attached to a website. 

`RETURNS` True or false boolean.

## Objects

`https://api.idyle.app/objects`

### /files/{folder}/{file}

### `POST`

Uploads a file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` File object.

### `DELETE`

Deletes a file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` True or false boolean.

### `GET`

Gets file metadata. Entering in **user** as the folder uses objects's default folder. Specifying query type returns the file data.

`ACCEPTS` Query "type" with value "download".

`REQUIRES` Valid folder name and valid file name.

`RETURNS` File metadata in form of an object or file data in the form of a buffer, if query.

### `PATCH`

Makes a file publicly accessible. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name and valid file name.

`RETURNS` True or false boolean.

### /folders/{folder} 

### `POST`

Lists all file names. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name.

`RETURNS` Array of file names.

### /archive/{folder} 

### `POST`

Archives a folder and uploads a compressed zipped file. Entering in **user** as the folder uses objects's default folder.

`REQUIRES` Valid folder name.

`RETURNS` True or false boolean.

## Documents

`https://api.idyle.app/documents`

### /documents/{collection}/{id}

### `POST`

Inserts a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### `PATCH`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### `PUT`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### `DELETE`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` True or false boolean.

### `GET`

Updates a JSON document. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` JSON document object.

### /collections/{collection} 

### `POST`

Lists all documents. Entering in **user** as the collection uses documents's default collection.

`REQUIRES` Valid collection name and valid object ID.

`RETURNS` Array of document objects.