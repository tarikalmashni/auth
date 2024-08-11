const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

const MASTER_PASSWORD = "i_am_a_masterpassword";
const SALT_ROUNDS = 10;

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify('Invalid JSON'),
    };
  }

  const { username, password, masterpassword, action } = body;

  if (masterpassword !== MASTER_PASSWORD) {
    return {
      statusCode: 403,
      body: JSON.stringify('No valid master password was provided'),
    };
  }

  if (action === 'add') {
    return await addUser(username, password);
  } else if (action === 'validate') {
    return await validateUser(username, password);
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify('Invalid action'),
    };
  }
};

async function addUser(username, password) {
  const params = {
    TableName: TABLE_NAME,
    Key: { username: username },
  };

  try {
    const data = await dynamo.get(params).promise();
    if (data.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify('Username already exists'),
      };
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const putParams = {
      TableName: TABLE_NAME,
      Item: {
        username: username,
        password: hashedPassword,
      },
    };

    await dynamo.put(putParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify('User created successfully'),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal server error'),
    };
  }
}

async function validateUser(username, password) {
  const params = {
    TableName: TABLE_NAME,
    Key: { username: username },
  };

  try {
    const data = await dynamo.get(params).promise();
    if (!data.Item || !bcrypt.compareSync(password, data.Item.password)) {
      return {
        statusCode: 401,
        body: JSON.stringify('Unauthorized'),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify('Authenticated'),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal server error'),
    };
  }
}
