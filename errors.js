class AutoRoleError extends Error {
  constructor(message) {
    super(message);
    this.name = "AutoRoleError";
  }
}

class RoleAlreadyAddedError extends AutoRoleError {
  constructor(message) {
    super(message);
    this.name = "RoleAlreadyAddedError";
  }
}

class RoleNotAddedError extends AutoRoleError {
  constructor(message) {
    super(message);
    this.name = "RoleNotAddedError";
  }
}

module.exports = {
  AutoRoleError,
  RoleAlreadyAddedError,
  RoleNotAddedError,
};
