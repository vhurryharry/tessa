const { isAuthenticated, isMember, isAdmin } = require("../authMiddleware");
const { isOrgMember } = require("../githubService");
const { UnauthorizedError } = require("../httpErrors");

jest.mock("../githubService");

describe("authMiddleware", () => {
  describe("isAuthenticated", () => {
    it("should call next if the request session has user data", () => {
      const next = jest.fn();
      isAuthenticated(
        { session: { userId: "1", githubUsername: "test" } },
        {},
        next
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if the request session does not have user data", () => {
      const next = jest.fn();
      isAuthenticated({ session: {} }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("isMember", () => {
    it("should call next if the logged in user is a member of the organization", async () => {
      const next = jest.fn();
      isOrgMember.mockResolvedValue(true);
      const githubOrganizationName = "test-organization";
      const accessToken = "test_access_token";
      const githubUsername = "test-github-username";
      await isMember(githubOrganizationName)(
        { session: { accessToken, githubUsername, userId: "1" } },
        {},
        next
      );
      expect(isOrgMember).toHaveBeenCalledWith(
        accessToken,
        githubUsername,
        githubOrganizationName
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if no user is logged in", async () => {
      const next = jest.fn();
      await isMember("test-organization")({ session: {} }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should call next with an UnauthorizedError if the logged in user is not a member of the organization", async () => {
      const next = jest.fn();
      isOrgMember.mockResolvedValue(false);
      await isMember("test-organization")(
        {
          session: {
            accessToken: "test_access_token",
            userId: 1,
            githubUsername: "test",
          },
        },
        {},
        next
      );
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("isAdmin", () => {
    it("should call next if the logged in user has user ID 1", () => {
      const next = jest.fn();
      isAdmin({ session: { userId: "1", githubUsername: "test" } }, {}, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if no user is logged in", () => {
      const next = jest.fn();
      isAdmin({ session: {} }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should call next with an UnauthorizedError if the logged in user does not have user ID 1", () => {
      const next = jest.fn();
      isAdmin({ session: { userId: "2", githubUsername: "test" } }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
