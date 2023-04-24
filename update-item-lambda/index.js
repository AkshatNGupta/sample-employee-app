const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log("Received event:", JSON.stringify(event));

	let { empid, department } = event.queryStringParameters;
	let { salary, age, name } = JSON.parse(event.body);

	let params = {
		TableName: "Employee",
		Key: {
			EmpId: parseInt(empid),
			Department: department,
		},
		UpdateExpression: "set Salary = :s, Age = :a, #n = :n",
		ExpressionAttributeValues: {
			":s": parseInt(salary),
			":a": parseInt(age),
			":n": name,
		},
		ExpressionAttributeNames: {
			"#n": "Name",
		},
		ReturnValues: "UPDATED_NEW",
	};
	if (salary > 50000) {
		params.UpdateExpression += ", Taxable = :t";
		params.ExpressionAttributeValues[":t"] = true;
	}
	return await dynamo
		.update(params)
		.promise()
		.then((data) => {
			console.log("data", data);
			return {
				statusCode: 200,
				body: JSON.stringify(data),
			};
		})
		.catch((err) => {
			console.log("err", err);
			return {
				statusCode: 500,
				body: JSON.stringify(err),
			};
		});
};
