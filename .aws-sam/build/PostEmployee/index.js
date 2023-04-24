const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log("Received event:", JSON.stringify(event));

	let { empid, department, name, age, salary } = JSON.parse(event.body);

	let params = {
		TableName: "Employee",
		Item: {
			EmpId: parseInt(empid),
			Department: department,
			Name: name,
			Age: parseInt(age),
			Salary: parseInt(salary),
		},
	};

	if (salary > 50000) {
		params.Item.Taxable = true;
	}
	return await dynamo
		.put(params)
		.promise()
		.then((data) => {
			console.log("data", data);
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Successfully added employee",
				}),
			};
		})
		.catch((err) => {
			console.log("err", err);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: "Error adding employee",
				}),
			};
		});
};
