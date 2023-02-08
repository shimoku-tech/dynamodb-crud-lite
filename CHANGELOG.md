# CHANGELOG

## 1.0.4 (2023-02-08)

### Text fix in README.md

* Fix instruction in Usage section of README.md.

## 1.0.3 (2023-02-07)

### Small text fixes in README.md and package.json

* Fixed installation instruction in README.md.
* Fixed url repository in package.json.

## 1.0.2 (2023-02-06)

### Resolved a npm publication issue

* Added this new version to resolve a npm publication issue.

## 1.0.0 (2023-02-05)

### Initial release of DynamoDB CRUD Lite, a JavaScript library for simplified CRUD operations on DynamoDB tables

* Includes functions for creating, updating, deleting, querying, and scanning items in a DynamoDB table.
* Automatically adds attributes `id`, `createdAt`, and `updatedAt` when creating an item and updates `updatedAt` when updating an item.
* Supports querying items by `id`, by index name, or by scanning the entire table.
* Returns results of query and scan operations as an array of items, with a `LastEvaluatedKey` property.
* Query and scan operations also supports filtering items using a filter expression and attribute names and values mapping.