import db from "../config/client.js";
import { describe, it } from "mocha";
import {
  SUCCESS,
  CONFLICT,
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  v1BaseURL,
  UNAUTHORIZED,
  FORBIDDEN,
} from "../types/constants.js";
import * as chai from "chai";
import axios from "axios";
import bcrypt from "bcrypt";
import { request, default as chaiHttp } from "chai-http";
import jwt from "jsonwebtoken";
import type { AxiosResponse } from "axios";
import { DelayedRequest } from "../utils/SyncRequest.js";

chai.use(chaiHttp);

describe("Testing the authentication middleware", function () {
  let user;
  after(async function () {
    await db.user.deleteMany();
  });

  before(async function () {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("SecretPassword", salt);
    user = await db.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "example@gmail.com",
        password: hashedPassword,
      },
    });
  });

  it("Should access protected route - Using a valid token", async function () {
    // Login and get credentials

    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "example@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.token");
    chai.expect(response).to.have.nested.property("data.user");
    chai
      .expect(response)
      .to.have.nested.property("data.message", "User logged in successfully");
    chai.expect(response.headers["set-cookie"]).to.not.be.undefined;
    const token = response.data.token;
    const cookies = response.headers["set-cookie"];

    // Access a protected route
    const protectedResponse = await axios(`${v1BaseURL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: cookies?.join(";"),
      },
      validateStatus: () => true,
    });

    chai.expect(protectedResponse).to.have.status(SUCCESS);
    chai.expect(protectedResponse).to.have.property("data");
    chai.expect(protectedResponse).to.have.nested.include({
      "data.user.email": "example@gmail.com",
      "data.user.firstName": "John",
      "data.user.lastName": "Doe",
    });
    chai
      .expect(protectedResponse.data)
      .to.not.have.nested.property("data.user.password");

    // checking the database for tokens stored
    const tokens = await db.token.findMany({
      where: {
        userId: user!.id,
      },
    });
    chai.expect(tokens.length).to.be.equal(1);
  });

  it("Should not access protected route - no authorization provided", async function () {
    const response = await axios
      .get(`${v1BaseURL}/users/me`, {
        validateStatus: () => true,
      })
      .catch((error) => {
        chai.expect.fail("Error happened: ", error);
      });

    chai.expect(response).to.have.status(UNAUTHORIZED);
    chai.expect(response).to.have.property("data");
    chai.expect(response).to.have.nested.includes({
      "data.message": "Unauthroized, no authorization provided",
    });
  });

  it("Should not access protected route - Using expired token", async function () {
    // Login and get credentials

    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "example@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.token");
    chai.expect(response).to.have.nested.property("data.user");
    chai
      .expect(response)
      .to.have.nested.property("data.message", "User logged in successfully");
    chai.expect(response.headers["set-cookie"]).to.not.be.undefined;
    const token = response.data.token;
    const cookies = response.headers["set-cookie"];

    // Waiting for 1 seconds to let the token expire
    const protectedResponse = await DelayedRequest(
      `${v1BaseURL}/users/me`,
      "GET",
      {
        Authorization: `Bearer ${token}`,
        Cookie: cookies?.join(";"),
      },
      null,
      {
        validateStatus: () => true,
      },
      1000
    );

    chai.expect(protectedResponse).to.have.status(UNAUTHORIZED);
    chai.expect(protectedResponse).to.have.property("data");
    chai.expect(protectedResponse).to.have.nested.include({
      "data.message": "Token is expired",
    });
  });

  it("Should not access protected route - Using invalid token", async function () {
    // Access a protected route
    const protectedResponse = await axios.get(`${v1BaseURL}/users/me`, {
      headers: {
        Authorization: `Bearer invalid_token`,
      },
      validateStatus: () => true,
    });

    chai.expect(protectedResponse).to.have.status(FORBIDDEN);
    chai.expect(protectedResponse).to.have.property("data");
    chai.expect(protectedResponse).to.have.nested.include({
      "data.message": "Token is invalid",
    });
  });

  it("Should not access protected route - Using token with invalid userId", async function () {
    // Create a token with an invalid userId
    const invalidToken = jwt.sign(
      {
        userId: "non_existing_user_id",
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        algorithm: "HS512",
        expiresIn: "1h",
      }
    );

    // Access a protected route
    const protectedResponse = await axios.get(`${v1BaseURL}/users/me`, {
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
      validateStatus: () => true,
    });

    chai.expect(protectedResponse).to.have.status(UNAUTHORIZED);
    chai.expect(protectedResponse).to.have.property("data");
    chai.expect(protectedResponse).to.have.nested.include({
      "data.message": "User not found",
    });
  });
});

describe("Testing the authentication APIs", function () {
  let user;
  after(async function () {
    await db.user.deleteMany();
  });

  before(async function () {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("SecretPassword", salt);
    user = await db.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "example@gmail.com",
        password: hashedPassword,
      },
    });
  });

  it("POST /api/v1/auth/register, Registering a user successfully", async function () {
    const response = await axios.post(
      `${v1BaseURL}/auth/register`,
      {
        firstName: "Abanoub",
        lastName: "Aziz",
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(CREATED);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response.data)
      .to.have.property("message", "User registered successfully");
    chai.expect(response.data).to.not.have.property("user");
    chai.expect(response.data).to.not.have.property("token");

    const createdUser = await db.user.findUnique({
      where: {
        email: "abanoub.aziz@gmail.com",
      },
    });

    if (!createdUser || !createdUser.password)
      chai.expect.fail("User is not found");
    chai.expect(createdUser?.firstName === "Abanoub").to.be.true;
    chai.expect(createdUser?.lastName === "Aziz").to.be.true;
    chai.expect(createdUser?.email === "abanoub.aziz@gmail.com").to.be.true;
    chai.expect(createdUser?.password).to.not.be.undefined;
    const passwordIsMatching = await bcrypt.compare(
      "SecretPassword",
      createdUser.password
    );
    chai.expect(passwordIsMatching).to.be.true;
  });

  it("POST /api/v1/auth/register, Should not register a user with existing email", async function () {
    const response = await axios.post(
      `${v1BaseURL}/auth/register`,
      {
        firstName: "Abanoub",
        lastName: "Aziz",
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(CONFLICT);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response.data)
      .to.have.property("message", "User with this email already exists");
  });

  it("POST /api/v1/auth/login, Logging in a user successfully", async function () {
    // Logging in a the user
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.property("data");
    chai.expect(response).to.have.nested.property("data.user");
    chai.expect(response).to.have.nested.property("data.token");
    chai
      .expect(response)
      .to.have.nested.property("data.message", "User logged in successfully");
    chai.expect(response.headers["set-cookie"]).to.not.be.undefined;
    chai
      .expect(response.data)
      .to.not.have.nested.property("data.user.password");
  });

  it("POST /api/v1/auth/login, Should not login with invalid credentials", async function () {
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
        password: "WrongPassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(UNAUTHORIZED);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response)
      .to.have.nested.property("data.message", "User credentails is invalid");
    chai.expect(response).to.not.have.nested.property("data.user");
    chai.expect(response).to.not.have.nested.property("data.token");
  });

  it("POST /api/v1/auth/login, Should not login with non existing email", async function () {
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "non.existing.email@gmail.com",
        password: "SomePassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response).to.have.status(BAD_REQUEST);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response)
      .to.have.nested.property("data.message", "User credentails is invalid");
  });

  it("POST /api/v1/auth/login, Should not login with missing fields", async function () {
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
      },
      {
        validateStatus: () => true,
      }
    );
    chai.expect(response).to.have.status(BAD_REQUEST);
    chai.expect(response).to.have.property("data");
    chai
      .expect(response)
      .to.have.nested.property(
        "data.message",
        "User credentials is not provided"
      );

    const response2 = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        password: "somepassword",
      },
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response2).to.have.status(BAD_REQUEST);
    chai.expect(response2).to.have.property("data");
    chai
      .expect(response2)
      .to.have.nested.property(
        "data.message",
        "User credentials is not provided"
      );
  });

  it("POST /api/v1/auth/refresh, Refreshing token successfully", async function () {
    // Login and get credentials

    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );
    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.token");
    chai.expect(response).to.have.nested.property("data.user");
    const token = response.data.token;
    const cookies = response.headers["set-cookie"];

    // Waiting for 1 seconds to let the token expire

    const response2 = await DelayedRequest(
      `${v1BaseURL}/users/me`,
      "GET",
      {
        Authorization: `Bearer ${token}`,
        Cookie: cookies?.join(";"),
      },
      null,
      {
        validateStatus: () => true,
      }
    );

    chai.expect(response2).to.have.status(UNAUTHORIZED);
    chai.expect(response2).to.have.property("data");
    chai
      .expect(response2)
      .to.have.nested.include({ "data.message": "Token is expired" });

    const response3 = await axios.get(`${v1BaseURL}/auth/refresh`, {
      headers: {
        Cookie: cookies?.join(";"),
      },
      validateStatus: () => true,
    });

    chai.expect(response3).to.have.status(SUCCESS);
    chai.expect(response3).to.have.property("data");
    chai.expect(response3).to.have.nested.property("data.token");
    chai
      .expect(response3)
      .to.have.nested.property(
        "data.message",
        "Access token refreshed successfully"
      );

    chai.expect(response3).to.have.nested.property("data.user");

    const newToken = response3.data.token;
    chai.expect(newToken).to.not.be.equal(token);

    const protectedResponse = await axios.get(`${v1BaseURL}/users/me`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
      validateStatus: () => true,
    });

    chai.expect(protectedResponse).to.have.status(SUCCESS);
  });

  it("POST /api/v1/auth/refresh, Should not refresh token with no cookies", async function () {
    // login and get credentials
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );
    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.token");
    chai.expect(response).to.have.nested.property("data.user");


    const response2 = await axios.get(`${v1BaseURL}/auth/refresh`, {
      validateStatus: () => true,
    });

    chai.expect(response2).to.have.status(UNAUTHORIZED);
    chai.expect(response2).to.have.property("data");
    chai
      .expect(response2)
      .to.have.nested.include({
        "data.message": "refreshToken is not provided",
      });
  });

  it("POST /api/v1/auth/refresh, Should not refresh token with expired cookies", async function () {
    // login and get credentials
    const response = await axios.post(
      `${v1BaseURL}/auth/login`,
      {
        email: "abanoub.aziz@gmail.com",
        password: "SecretPassword",
      },
      {
        validateStatus: () => true,
      }
    );
    chai.expect(response).to.have.status(SUCCESS);
    chai.expect(response).to.have.nested.property("data.token");
    chai.expect(response).to.have.nested.property("data.user");

    const cookies = response.headers["set-cookie"];

    // wait until the refreshToken expires
    const response2 = await DelayedRequest(
      `${v1BaseURL}/auth/refresh`,
      "GET",
      {
        Cookie: cookies?.join(";"),
      },
      null,
      {
        validateStatus: () => true,
      },
      6000
    );

    chai.expect(response2).to.have.status(UNAUTHORIZED);
    chai.expect(response2).to.have.property("data");
    chai
      .expect(response2)
      .to.have.nested.include({ "data.message": "Invalid refreshToken" });
  });
});
