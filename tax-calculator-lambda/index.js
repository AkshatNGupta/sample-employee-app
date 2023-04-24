const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log("Received event:", JSON.stringify(event));

	// Iterate over records in the event
	for (const record of event.Records) {
		if (record.eventName === "INSERT") {
			await insertFunction(record);
		} else if (record.eventName === "MODIFY") {
			await updateFunction(record);
		} else if (record.eventName === "REMOVE") {
			await deleteFunction(record);
		}
	}
};
async function deleteFunction(record) {
	let EmpId = record.dynamodb.OldImage.EmpId.N;
	let Department = record.dynamodb.OldImage.Department.S;
	EmpId = parseInt(EmpId);
	// delete the record
	await dynamo
		.delete({
			TableName: "Tax",
			Key: {
				EmpId: EmpId,
				Department: Department,
			},
			// ConditionExpression: "attribute_exists(EmpId) AND attribute_exists(Department)",
		})
		.promise()
		.then((data) => {
			console.log("data", data);
		})
		.catch((err) => {
			console.log("err", err);
		});
}

async function updateFunction(record) {
	let EmpId = record.dynamodb.NewImage.EmpId.N;
	let Department = record.dynamodb.NewImage.Department.S;
	let Salary = record.dynamodb.NewImage.Salary.N;
	let tax = 0;
	EmpId = parseInt(EmpId);
	Salary = parseInt(Salary);

	if (Salary < 50000) {
		tax = 0;
	} else if (Salary < 100000) {
		tax = Salary * 0.1;
	} else if (Salary < 150000) {
		tax = Salary * 0.2;
	} else {
		tax = Salary * 0.3;
	}
	// update the record
	await dynamo
		.update({
			TableName: "Tax",
			Key: {
				EmpId: EmpId,
				Department: Department,
			},
			UpdateExpression: "set Tax = :t",
			// ConditionExpression: "attribute_exists(EmpId) AND attribute_exists(Department) AND Tax = :oldTax",
			ExpressionAttributeValues: {
				":t": tax,
				// ":oldTax": parseFloat(record.dynamodb.OldImage.Tax.N),
			},
			ReturnValues: "UPDATED_NEW",
		})
		.promise()
		.then((data) => {
			console.log("data", data);
		})
		.catch((err) => {
			console.log("err", err);
		});
}

async function insertFunction(record) {
	let EmpId = record.dynamodb.NewImage.EmpId.N;
	let Department = record.dynamodb.NewImage.Department.S;
	let Salary = record.dynamodb.NewImage.Salary.N;
	EmpId = parseInt(EmpId);
	Salary = parseInt(Salary);
	let tax = 0;
	// calculate tax
	if (Salary < 50000) {
		tax = 0;
	} else if (Salary < 100000) {
		tax = Salary * 0.1;
	} else if (Salary < 150000) {
		tax = Salary * 0.2;
	} else {
		tax = Salary * 0.3;
	}
	// insert the record
	await dynamo
		.put({
			TableName: "Tax",
			Item: {
				EmpId: EmpId,
				Department: Department,
				Tax: tax,
			},
			// ConditionExpression: "attribute_not_exists(EmpId) AND attribute_not_exists(Department)",
		})
		.promise()
		.then((data) => {
			console.log("data", data);
		})
		.catch((err) => {
			console.log("err", err);
		});
}

