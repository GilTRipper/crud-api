const request = require("supertest");

const baseUrl = "http://localhost:4000";

describe("API: Users", () => {
  const testUser = {
    username: "TestUser",
    age: 99,
    hobbies: ["testHobby"],
    id: "",
  };

  test("Should return all users' records ", async () => {
    const response = await request(baseUrl).get("/api/users");
    const { users } = response.body;

    expect(response.status).toBe(200);
    expect(users).toStrictEqual([]);
  });

  test("Should create a user and return an object", async () => {
    const response = await request(baseUrl).post("/api/users").send(testUser);
    const { user } = response.body;

    testUser.id = user.id;

    expect(user.id).toBeDefined();
    expect(user).toStrictEqual(testUser);
  });

  test("Should get user record by it's id", async () => {
    const response = await request(baseUrl).get(`/api/users/${testUser.id}`);
    const { user } = response.body;

    expect(user).toStrictEqual(testUser);
  });

  test("Should put some data to user record and return object", async () => {
    const response = await request(baseUrl)
      .put(`/api/users/${testUser.id}`)
      .send({ ...testUser, hobbies: [...testUser.hobbies, "testing"] });

    const { user } = response.body;
    testUser.hobbies.push("testing");

    expect(user).toEqual(testUser);
  });

  test("Should delete user by id", async () => {
    const response = await request(baseUrl).delete(`/api/users/${testUser.id}`);
    const status = response.status;

    expect(status).toBe(204);
  });

  test("Should get an error trying to fetch deleted user", async () => {
    const response = await request(baseUrl).get(`/api/users/${testUser.id}`);
    const { error } = response.body;

    expect(error).toBe("User not found");
  });
});
