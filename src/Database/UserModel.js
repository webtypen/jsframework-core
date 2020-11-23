const Model = require("./Model");

class UserModel extends Model {
    hasRole(role) {
        if (this.roles && this.roles.includes(role)) {
            return true;
        }
        return false;
    }
}

module.exports = UserModel;
