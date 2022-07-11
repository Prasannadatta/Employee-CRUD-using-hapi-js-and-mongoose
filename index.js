'use strict';

const Hapi = require("@hapi/hapi");
const Mongoose = require("mongoose");
const Joi = require("joi");
Mongoose.connect('mongodb://localhost:27017/employees');
const empSchema = new Mongoose.Schema({
  FirstName: String,
  LastName: String,
  Email: String,
  Mobile: String,
  Gender: String,
  Designation: String,
  DateOfJoining: Date,
  ReportingManager: String,
  Salary: Number,
  EmployeeCode: Number,
  Location: String,
  State: String,
  Country: String,
  Department: String,
  DeletedAt: {
    type: Date,
    default: null
  }
});

const emp = Mongoose.model('emp',empSchema);

// asynchronous intialization of server
const init = async () => {

  const server = Hapi.server({
    port: 100,
    host: 'localhost'
  });

// route for creating an employee
server.route({
  method: 'POST',
  path: '/api/employee',
  handler: async (request, h) => {

    let newEmployee =new emp(request.payload);
    await newEmployee.save();
    return h.response('employee created');

  },
 options: {
    validate: {
        payload:Joi.object({
            FirstName: Joi.string(),
            LastName: Joi.string(),
            Email: Joi.string(),
            Mobile: Joi.string(),
            Gender: Joi.string(),
            Designation: Joi.string(),
            DateOfJoining: Joi.date(),
            ReportingManager: Joi.string(),
            Salary: Joi.number(),
            EmployeeCode: Joi.number(),
            Location: Joi.string(),
            State: Joi.string(),
            Country: Joi.string(),
            Department: Joi.string(),
        })
    }
}
});

// route for updating an employee using id
server.route({
  method: 'PUT',
  path: '/api/employee/{_id}',
  handler: async (request, h) => {

    let updated = await emp.updateOne({_id: request.params._id },request.payload);
    return h.response('employee updated');

  },
 options: {
    validate: {
        payload:Joi.object({
            FirstName: Joi.string(),
            LastName: Joi.string(),
            Email: Joi.string(),
            Mobile: Joi.string(),
            Gender: Joi.string(),
            Designation: Joi.string(),
            DateOfJoining: Joi.date(),
            ReportingManager: Joi.string(),
            Salary: Joi.number(),
            EmployeeCode: Joi.number(),
            Location: Joi.string(),
            State: Joi.string(),
            Country: Joi.string(),
            Department: Joi.string(),
        })
    }
}
});

// route to get list of employees and filter the list using query parameters
// Query Params: FirstName, LastName, Department, Email, Gender, Designation, ReportingManager, Location
// Note: If the query parameter is FirstName, then filter the list using FirstName and return all the matching documents. If query parameters are FirstName and Department, then return all the documents matching FirstName AND Department from the query.
server.route({
  method: 'GET',
  path: '/api/employees',
  handler: async (request, h) => {
    let output = await emp.find(request.query);
    return h.response(output);
      }
});

// route to get count of employees and filter using query paramters
server.route({
  method: 'GET',
  path: '/api/employees/count',
  handler: async (request, h) => {
    let counted= await emp.find(request.query).count();
    return h.response(counted);
  }
});

//route to deactivate or activate employee
//If the action is ‘deactivate’, set DeletedAt key to current date.
//If action is ‘activate’, set DeletedAt to null. Do not remove the employee from the database.
server.route({
  method: 'PUT',
  path: '/api/employee/{_id}/{action}',

   handler: async (request, h) => {
     if(request.params.action=='activate')
     {
        let activated = await emp.updateOne({_id:request.params._id},{"DeletedAt": null});
     }
    else if(request.params.action=='deactivate')
    {
       let deactivated = await emp.updateOne({_id:request.params._id},{"DeletedAt":Date.now()});
    }

    return h.response('DeletedAt changed');
 }
});

// starting the server
  await  server.start( err => {
    if(err)
    {
      console.log(err);
    }
  });
  console.log('Server running on %s', server.info.uri);

};

init();
