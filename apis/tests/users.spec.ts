import db from "../config/client.js";
import { describe, it } from "mocha";
import {
  SUCCESS,
  CONFLICT,
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
} from "../types/constants.js";
import * as chai from "chai";
import axios from "axios";
import bcrypt from "bcrypt";
import { request, default as chaiHttp } from "chai-http";

chai.use(chaiHttp);
const baseURL = "http://localhost:5000/api/v1/users/";

describe("Testing User APIs and CRUD Operations", function () {
  after(async function () {
    await db.user.deleteMany();
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
    chai
      .expect(response.data)
      .to.not.have.nested.property("data.user.password");
    chai.expect(response).to.have.status(CREATED);

    const user = await db.user.findUnique({
      where: {
        email: "example@gmail.com",
      },
    });
    if (!user || !user.password) chai.expect.fail("User is not found");
    chai.expect(user?.firstName === "Abanoub").to.be.true;
    chai.expect(user?.lastName === "Aziz").to.be.true;
    chai.expect(user?.email === "example@gmail.com").to.be.true;
    chai.expect(user?.password).to.not.be.undefined;
    const passwordIsMatching = await bcrypt.compare(
      "Abanoub2025",
      user?.password
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
    chai.expect(response).to.have.status(CONFLICT);
    chai.expect(response).to.have.nested.property("data");
    chai.expect(response.data).to.have.property("message");
  });

  it("PUT /api/v1/users/:id, Updating a user successfully", async function () {
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
    if (!updatedUser || !updatedUser.password) chai.expect.fail("Updated user is null");
    chai.expect(updatedUser?.firstName).to.equal("Abelrahman");
    chai.expect(updatedUser?.lastName).to.equal("Riyad");
    chai.expect(response).to.have.status(SUCCESS);
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
    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data");
    chai.expect(response).to.have.nested.include({
      "data.user.firstName": "Abelrahman",
      "data.user.lastName": "Riyad",
      "data.user.email": "example@gmail.com",
    });
  });

  it("GET /api/v1/users/:id, Fetching a user which doesn't exist", async function () {
    const response = await axios.get(`${baseURL}no-such-id-exist`, {
      validateStatus: () => true,
    });

    chai.expect(response).to.have.status(NOT_FOUND);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response.data)
      .to.have.property("message", "User not found");
  });

  it("GET /api/v1/users, Getting all the users", async function () {
    const users = await db.user.createMany({
      data: [
        {
          firstName: "ex1",
          lastName: "es1",
          email: "ex1@gmail.com",
          password: "pass1",
        },
        {
          firstName: "ex2",
          lastName: "es2",
          email: "ex2@gmail.com",
          password: "pass2",
        },
        {
          firstName: "ex3",
          lastName: "es3",
          email: "ex3@gmail.com",
          password: "pass3",
        },
      ],
      skipDuplicates: true,
    });

    if (!users) chai.expect.fail("Users creation failed");
    const response = await axios.get(baseURL);
    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.users");
    chai.expect(response.data.users).length(4);

    const user = await db.user.create({
      data: {
        firstName: "ex4",
        lastName: "es4",
        email: "ex4@gmail.com",
        password: "pass4",
      },
    });

    if (!user) chai.expect.fail("User creation failed");
    const response2 = await axios.get(baseURL);
    chai.expect(response2).to.have.status(SUCCESS);
    chai.expect(response2).to.have.nested.property("data.users");
    chai.expect(response2.data.users).length(5);
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
    chai.expect(response).to.have.status(SUCCESS);
  });

  it("DELETE /api/v1/users/:id, Deleting a user not found on the database", async function () {
    const response = await axios.delete(`${baseURL}no-such-id-exist`, {
      validateStatus: () => true,
    });
    chai.expect(response).to.have.status(NOT_FOUND);
    chai
      .expect(response.data)
      .to.have.property("message", "User not found");
  });
});
