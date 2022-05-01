module.exports = class User {
    constructor(userInf) {
        this.firstName = userInf.FIRST_NAME;
        this.lastName = userInf.LAST_NAME;
        this.fullName = userInf.FULL_NAME;
    }
    getFullName() {
        return this.fullName
    }
}