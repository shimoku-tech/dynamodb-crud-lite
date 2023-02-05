# DynamoDB CRUD Lite

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://shields.io/)

JavaScript library for simplified CRUD operations on DynamoDB tables.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the DynamoDB CRUD Lite, you can use `npm`:

```bash
npm install dynamodb-crud-lite
```

## Usage

To use the DynamoDB CRUD Lite, import the functions you need from the library:

```javascript
import { createItem, updateItem, deleteItem, query, scan } from 'dynamodb-crud-lite';
```

### Creating an Item

The `createItem` function allows you to create an item in a DynamoDB table. It takes in the table name and an object containing the attributes of the item to be created as its parameters. Attributes `id`, `createdAt`, and `updatedAt` are automatically added to the item with the following values: `id` is set to a new UUID v4, `createdAt` and `updatedAt` are set to the current timestamp in format `yyyy-MM-ddTHH:mm:ss.sssZ`.

```javascript
const item = await createItem('tableName', { attribute1: 'value1', attribute2: 'value2' });
```

### Updating an Item

The `updateItem` function allows you to update an item in a DynamoDB table. It takes in the table name, the hash key value of the item to be updated (assuming that a `id` attribute is the hash key of the table), and an object containing the attributes to be updated as its parameters. The `updatedAt` attribute is automatically updated with the current timestamp in format `yyyy-MM-ddTHH:mm:ss.sssZ`.

```javascript
const item = await updateItem('tableName', 'id', { attribute1: 'value1', attribute2: 'value2' });
```

### Deleting an Item

The `deleteItem` function allows you to delete an item from a DynamoDB table. It takes in the table name and the id of the item to be deleted as its parameters.

```javascript
const item = await deleteItem('tableName', 'id');
```

### Querying Items

The `query` function allows you to retrieve items from a DynamoDB table by either their `id` or by using an `indexName`. The function takes in the table name and a query object as its parameters.

The query object can contain the following properties to specify the search criteria:

- `id`: Retrieves the item with the specific id.
- `indexName`: The name of the index to be used in querying the table (if the table has global secondary indexes).
- `hashKeyName` and `hashKeyValue`: The name and value of the hash key to be used in querying the table.
- `rangeKeyName` and `rangeKeyValue`: The name and value of the range key to be used in querying the table.
- `filterExpression`: A filter expression used to filter the items returned from the query.
- `filterNames`: An object that maps the names of attributes in the filter expression to their corresponding attribute names in the DynamoDB table.
- `filterValues`: An object that maps the names of the attribute values in the filter expression to their corresponding values.
- `limit`: A limit on the number of items returned by the query.
- `exclusiveStartKey`: The exclusive start key to be used in querying the table.

The function returns a promise that resolves to the following object:

- If the query is performed by `id`, the item with the matching id is returned.
- If the query is performed by `indexName`, an object containing an array of items (items) and a `LastEvaluatedKey` property. The `LastEvaluatedKey` property is a base64 encoded string that can be used as the `exclusiveStartKey` in the next query.

Note: If the query is performed by `id` and no item is found, the promise is rejected with an error message "Item not found".

```javascript
const item = await query('tableName', { id: 'id' });
```

```javascript
const items = await query('tableName', { indexName: 'indexName', hashKeyName: 'hashKeyName', hashKeyValue: 'hashKeyValue' });
```

### Scanning Items

The `scan` function allows you to retrieve data from a DynamoDB table by scanning the entire table. It takes in the table name and an optional query object as its parameters.

- `filterExpression`: A string that represents the filter to be applied to the scan operation.
- `filterNames`: An object that maps the attribute names in filterExpression to their respective attribute names in the table.
- `filterValues`: An object that maps the placeholders in filterExpression to their respective values.
- `limit`: The maximum number of items to be retrieved by the scan operation.
- `exclusiveStartKey`: A base64 encoded string that represents the primary key of the item after which the scan operation is to begin.

The function returns a promise that resolves to an object containing the following properties:

- `items`: An array of items retrieved by the scan operation.
- `LastEvaluatedKey`: A base64 encoded string that represents the primary key of the last item evaluated in the scan operation. This can be used as the `exclusiveStartKey` in the next query.

Note: If there are no more items to retrieve in the table, LastEvaluatedKey will be undefined.

```javascript
const items = await scan('tableName', { filterExpression: 'attribute1 = :value1', filterValues: { ':value1': 'value1' } });
```

## Contributing

We welcome contributions to the DynamoDB CRUD Lite. To contribute, please fork the repository and create a pull request with your changes.

## License

The DynamoDB CRUD Lite is released under the MIT License.