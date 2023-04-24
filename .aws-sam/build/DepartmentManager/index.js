const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log("Received event:", JSON.stringify(event));

	for (const record of event.Records) {
		if (record.eventName === "INSERT") {
			const employee = record.dynamodb.NewImage;
			const department = employee.Department.S;
			const salary = parseInt(employee.Salary.N);
			const age = parseInt(employee.Age.N);
			const taxableRecord = employee.Taxable ? employee.Taxable.BOOL : false;

			const oldAggregatesData = await dynamo
				.get({
					TableName: "Department",
					Key: {
						Department: department,
					},
				})
				.promise();
			const oldAggregates = oldAggregatesData.Item || {
				NumEmployees: 0,
				TotalSalary: 0,
				AvgSalary: 0,
				AvgAge: 0,
				NumOfTaxableEmployees: 0,
			};

			const newAggregates = {
				NumEmployees: oldAggregates.NumEmployees + 1,
				TotalSalary: oldAggregates.TotalSalary + salary,
				AvgSalary: (oldAggregates.TotalSalary + salary) / (oldAggregates.NumEmployees + 1),
				AvgAge: (oldAggregates.AvgAge * oldAggregates.NumEmployees + age) / (oldAggregates.NumEmployees + 1),
				NumOfTaxableEmployees: oldAggregates.NumOfTaxableEmployees + (taxableRecord ? 1 : 0),
			};

			await dynamo
				.put({
					TableName: "Department",
					Item: {
						Department: department,
						...newAggregates,
					},
				})
				.promise();
		} else if (record.eventName === "MODIFY") {
			const employee = record.dynamodb.NewImage;
			const oldEmployee = record.dynamodb.OldImage;
			const department = employee.Department.S;
			const salary = parseInt(employee.Salary.N);
			const oldSalary = parseInt(oldEmployee.Salary.N);
			const age = parseInt(employee.Age.N);
			const oldAge = parseInt(oldEmployee.Age.N);
			const taxableRecord = employee.Taxable ? employee.Taxable.BOOL : false;
			const oldTaxableRecord = oldEmployee.Taxable ? oldEmployee.Taxable.BOOL : false;

			const oldAggregatesData = await dynamo
				.get({
					TableName: "Department",
					Key: {
						Department: department,
					},
				})
				.promise();
			const oldAggregates = oldAggregatesData.Item || {
				NumEmployees: 0,
				TotalSalary: 0,
				AvgSalary: 0,
				AvgAge: 0,
				NumOfTaxableEmployees: 0,
			};

			const newAggregates = {
				NumEmployees: oldAggregates.NumEmployees,
				TotalSalary: oldAggregates.TotalSalary - oldSalary + salary,
				AvgSalary: (oldAggregates.TotalSalary - oldSalary + salary) / oldAggregates.NumEmployees,
				AvgAge: (oldAggregates.AvgAge * oldAggregates.NumEmployees - oldAge + age) / oldAggregates.NumEmployees,
				NumOfTaxableEmployees: oldAggregates.NumOfTaxableEmployees - (oldTaxableRecord ? 1 : 0) + (taxableRecord ? 1 : 0),
			};

			await dynamo
				.put({
					TableName: "Department",
					Item: {
						Department: department,
						...newAggregates,
					},
				})
				.promise();
		} else if (record.eventName === "REMOVE") {
			const employee = record.dynamodb.OldImage;
			const department = employee.Department.S;
			const salary = parseInt(employee.Salary.N);
			const age = parseInt(employee.Age.N);
			const taxableRecord = employee.Taxable ? employee.Taxable.BOOL : false;

			const oldAggregatesData = await dynamo
				.get({
					TableName: "Department",
					Key: {
						Department: department,
					},
				})
				.promise();
			const oldAggregates = oldAggregatesData.Item || {
				NumEmployees: 0,
				TotalSalary: 0,
				AvgSalary: 0,
				AvgAge: 0,
				NumOfTaxableEmployees: 0,
			};

			const newAggregates = {
				NumEmployees: oldAggregates.NumEmployees - 1,
				TotalSalary: oldAggregates.TotalSalary - salary,
				AvgSalary: (oldAggregates.TotalSalary - salary) / (oldAggregates.NumEmployees - 1),
				AvgAge: (oldAggregates.AvgAge * oldAggregates.NumEmployees - age) / (oldAggregates.NumEmployees - 1),
				NumOfTaxableEmployees: oldAggregates.NumOfTaxableEmployees - (taxableRecord ? 1 : 0),
			};

			await dynamo
				.put({
					TableName: "Department",
					Item: {
						Department: department,
						...newAggregates,
					},
				})
				.promise();
		}
	}
};
