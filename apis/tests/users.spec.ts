import db from "../config/client.js";
import { describe, it } from "mocha";
import * as chai from "chai";
import axios from "axios";
import bcrypt from "bcrypt";
import { request, default as chaiHttp } from "chai-http";

chai.use(chaiHttp);
const baseURL = "http://localhost:5000/api/v1/users/";

describe("User APIs and CRUD Operations tests", function () {
  after(async function () {
    const users = await db.user.deleteMany();
  });

  
  it("POST /api/v1/users, Creating a user sucessfully", async function () {
    const response = await axios.post(baseURL, {
      firstName: "Abanoub",
      lastName: "Aziz",
      email: "example@gmail.com",
      password: "Abanoub2025",
    });
    chai.expect(response).to.have.property("data");
    chai.expect(response).to.nested.include({
      "data.user.firstName": "Abanoub",
      "data.user.lastName": "Aziz",
      "data.user.email": "example@gmail.com",
    });
    chai.expect(response.data).to.not.have.nested.property("data.user.password");
    chai.expect(response).to.have.status(201);

    const user = await db.user.findUnique({
      where: {
        email: "example@gmail.com",
      },
    });
    if (!user) chai.expect.fail("User is not found");
    chai.expect(user?.firstName === "Abanoub").to.be.true;
    chai.expect(user?.lastName === "Aziz").to.be.true;
    chai.expect(user?.email === "example@gmail.com").to.be.true;
    chai.expect(user?.password).to.not.be.undefined;
    const passwordIsMatching = await bcrypt.compare(
      "Abanoub2025",
      user!.password
    );
    chai.expect(passwordIsMatching).to.be.true;
  });



  it("POST /api/v1/users, Should not create a user with existing email", async function () {
    const response = await axios.post(
      baseURL,
      {
        firstName: "Abanoub",
        lastName: "Aziz",
        email: "example@gmail.com",
        password: "Abanoub2025",
      },
      {
        validateStatus: () => true,
      }
    );
    chai.expect(response).to.have.status(409);
    chai.expect(response).to.have.nested.property("data");
    chai.expect(response.data).to.have.property("Error message");
  });

  it("POST /api/v1/users/:id, Updating a user successfully", async function () {
    const user = await db.user.findFirst({
      where: {
        email: "example@gmail.com",
      },
    });
    if (!user) chai.expect.fail("User is null");
    const response = await axios.put(`${baseURL}${user.id}`, {
      firstName: "Abelrahman",
      lastName: "Riyad",
      password: "Abelrahman2025",
    });
    const updatedUser = await db.user.findUnique({
      where: {
        email: "example@gmail.com",
      },
    });

    chai.expect(updatedUser).not.to.be.null;
    if (!updatedUser) chai.expect.fail("Updated user is null");
    chai.expect(updatedUser?.firstName).to.equal("Abelrahman");
    chai.expect(updatedUser?.lastName).to.equal("Riyad");
    chai.expect(response).to.have.status(200);
    chai.expect(response).to.have.nested.property("data");
    chai.expect(response).to.not.have.nested.property("data.user.password");
    chai.expect(response).to.have.nested.include({
      "data.user.firstName": "Abelrahman",
      "data.user.lastName": "Riyad",
      "data.user.email": "example@gmail.com",
    });

    chai.expect(updatedUser?.password).to.not.be.undefined;
    const passwordIsMatching = await bcrypt.compare(
      "Abelrahman2025",
      updatedUser!.password
    );
    chai.expect(passwordIsMatching).to.be.true;
  });

  it("GET /api/v1/users/:id, Fetching a user successfully", async function () {
    const user = await db.user.findFirst({
      where: {
        email: "example@gmail.com",
      },
    });

    const userId = user?.id;
    if (!userId) {
      chai.expect.fail("User is not found in database");
    }

    const response = await axios.get(`${baseURL}${userId}`);
    chai.expect(response).to.have.status(200);
    chai.expect(response).to.have.nested.property("data");
    chai.expect(response).to.have.nested.include({
      "data.user.firstName": "Abelrahman",
      "data.user.lastName": "Riyad",
      "data.user.email": "example@gmail.com",
    });
  });

  it("DELETE /api/v1/users/:id, Deleting a user found on the database", async function () {
    const user = await db.user.findFirst({
      where: {
        email: "example@gmail.com",
      },
    });
    const userId = user?.id;
    if (!userId) {
      chai.expect.fail("User is not found in database");
    }

    const response = await axios.delete(`${baseURL}${userId}`);
    chai.expect(response).to.have.status(200)
  });
});
