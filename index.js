import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

function createItem(tableName, attributes) {
  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...attributes
  };

  const params = {
    TableName: tableName,
    Item: item
  };

  return new Promise((resolve, reject) => {
    dynamoDB.put(params, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(item);
      }
    });
  });
};

function updateItem(tableName, id, attributes) {
  let updateExpression = "";
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};
  let hasValuesToUpdate = false;

  for (const attribute in attributes) {
    if (typeof attributes[attribute] !== "undefined") {
      updateExpression = `${updateExpression}${updateExpression ? ', ' : 'set'} #${attribute} = :${attribute}`;
      expressionAttributeNames[`#${attribute}`] = attribute;
      expressionAttributeValues[`:${attribute}`] = attributes[attribute];
      hasValuesToUpdate = true;
    }
  }

  if (hasValuesToUpdate) {
    return new Promise((resolve, reject) => {
      dynamoDB.get({
        TableName: tableName,
        Key: { id },
      }, (error, data) => {
        if (error) {
          reject(error);
        } else if (!data.Item) {
          reject(new Error(`Item not found`));
        } else {
          const now = new Date().toISOString();
          updateExpression = `${updateExpression}${updateExpression ? ', ' : 'set'} updatedAt = :u`;
          expressionAttributeValues[':u'] = now;

          const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
          };

          dynamoDB.update(params, (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data.Attributes);
            }
          });
        }
      });
    });
  } else {
    return Promise.reject(new Error('No values to update'));
  }
};

function deleteItem(tableName, id) {
  const params = {
    TableName: tableName,
    Key: { id },
    ReturnValues: 'ALL_OLD'
  };

  return new Promise((resolve, reject) => {
    dynamoDB.delete(params, (error, data) => {
      if (error) {
        reject(error);
      } else if (!data.Attributes) {
        reject(new Error('Item not found'));
      } else {
        resolve();
      }
    });
  });
}

/*
 * Supports querying by id or by indexName by providing hashKeyName and hashKeyValue and optionally rangeKeyName and rangeKeyValue.
 * Supports filtering using filterExpression, filterName, and filterValues.
 * limit and exclusiveStartKey are optional.
 * Returns lastEvaluatedKey, base64 encoded, which can be used as exclusiveStartKey in the next query.
 */
function query(tableName, query = {}) {
  let KeyConditionExpression = "";
  let ExpressionAttributeNames = {};
  let ExpressionAttributeValues = {};
  let FilterExpression = "";

  if (query.id) {
    KeyConditionExpression = KeyConditionExpression ? `${KeyConditionExpression} and id = :id` : "id = :id";
    ExpressionAttributeValues = { ...ExpressionAttributeValues, ":id": query.id };
  }

  if (query.hashKeyName && query.hashKeyValue) {
    KeyConditionExpression = KeyConditionExpression ? `${KeyConditionExpression} and #${query.hashKeyName} = :${query.hashKeyName}` : `#${query.hashKeyName} = :${query.hashKeyName}`;
    ExpressionAttributeNames = { ...ExpressionAttributeNames, [`#${query.hashKeyName}`]: query.hashKeyName };
    ExpressionAttributeValues = { ...ExpressionAttributeValues, [`:${query.hashKeyName}`]: query.hashKeyValue };
  }

  if (query.rangeKeyName && query.rangeKeyValue) {
    KeyConditionExpression = KeyConditionExpression ? `${KeyConditionExpression} and #${query.rangeKeyName} = :${query.rangeKeyName}` : `#${query.rangeKeyName} = :${query.rangeKeyName}`;
    ExpressionAttributeNames = { ...ExpressionAttributeNames, [`#${query.rangeKeyName}`]: query.rangeKeyName };
    ExpressionAttributeValues = { ...ExpressionAttributeValues, [`:${query.rangeKeyName}`]: query.rangeKeyValue };
  }

  if (query.filterExpression) {
    FilterExpression = query.filterExpression;
    if (query.filterNames) {
      for (const name in query.filterNames) {
        ExpressionAttributeNames = { ...ExpressionAttributeNames, [`${name}`]: query.filterNames[name] };
      }
    }
    if (query.filterValues) {
      for (const value in query.filterValues) {
        ExpressionAttributeValues = { ...ExpressionAttributeValues, [`${value}`]: query.filterValues[value] };
      }
    }
  }

  const params = {
    TableName: tableName,
    ...(KeyConditionExpression && { KeyConditionExpression }),
    ...(Object.keys(ExpressionAttributeNames).length && { ExpressionAttributeNames }),
    ...(Object.keys(ExpressionAttributeValues).length && { ExpressionAttributeValues }),
    ...(FilterExpression && { FilterExpression }),
    ...(query.indexName && { IndexName: query.indexName }),
    ...(query.limit && { Limit: query.limit }),
    ...(query.exclusiveStartKey && { ExclusiveStartKey: JSON.parse(Buffer.from(query.exclusiveStartKey, 'base64').toString()) })
  };

  return new Promise((resolve, reject) => {
    dynamoDB.query(params, (error, data) => {
      if (error) {
        reject(error);
      } else if (query.id && data.Items.length === 0) {
        reject(new Error('Item not found'));
      } else if (query.id) {
        resolve(data.Items[0]);
      } else {
        resolve({ items: data.Items, LastEvaluatedKey: data.LastEvaluatedKey ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64') : undefined });
      }
    });
  });
}

/*
 * limit and exclusiveStartKey are optional
 * Returns lastEvaluatedKey, base64 encoded, which can be used as exclusiveStartKey in the next query.
 */
function scan(tableName, query = {}){
  let ExpressionAttributeNames = {};
  let ExpressionAttributeValues = {};
  let FilterExpression = "";

  if (query.filterExpression) {
    FilterExpression = query.filterExpression;
    if (query.filterNames) {
      for (const name in query.filterNames) {
        ExpressionAttributeNames = { ...ExpressionAttributeNames, [`${name}`]: query.filterNames[name] };
      }
    }
    if (query.filterValues) {
      for (const value in query.filterValues) {
        ExpressionAttributeValues = { ...ExpressionAttributeValues, [`${value}`]: query.filterValues[value] };
      }
    }
  }

  const params = {
    TableName: tableName,
    ...(Object.keys(ExpressionAttributeNames).length && { ExpressionAttributeNames }),
    ...(Object.keys(ExpressionAttributeValues).length && { ExpressionAttributeValues }),
    ...(FilterExpression && { FilterExpression }),
    ...(query.limit && { Limit: query.limit }),
    ...(query.exclusiveStartKey && { ExclusiveStartKey: JSON.parse(Buffer.from(query.exclusiveStartKey, 'base64').toString()) })
  };

  return new Promise((resolve, reject) => {
    dynamoDB.scan(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve({ items: data.Items, LastEvaluatedKey: data.LastEvaluatedKey ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64') : undefined });
      }
    });
  });
}

export { createItem, updateItem, deleteItem, query, scan };