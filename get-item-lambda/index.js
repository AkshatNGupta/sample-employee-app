const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log("Received event:", JSON.stringify(event));

	let { empid, department } = event.queryStringParameters;
	return await dynamo
		.get({
			TableName: "Employee",
			Key: {
				EmpId: parseInt(empid),
				Department: department,
			},
		})
		.promise()
		.then((data) => {
			console.log("data", data);
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Successfully got employee",
					employee: data.Item,
				}),
			};
		})
		.catch((err) => {
			console.log("err", err);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: "Error getting employee",
				}),
			};
		});
};
