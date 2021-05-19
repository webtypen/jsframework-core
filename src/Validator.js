const lodash = require("lodash");

const validatorRules = {
    required: (field, value, object, args, options) => {
        const fieldName = options && options.names && options.names[field] ? options.names[field] : field;
        return value === undefined || value === null || value.toString().trim() === ""
            ? "Das Feld `" + fieldName + "` muss ausgefüllt werden"
            : null;
    },
    email: (field, value, object, args, options) => {
        const emailRegexp =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        if (!emailRegexp.test(value)) {
            const fieldName = options && options.names && options.names[field] ? options.names[field] : field;
            return "Das Feld `" + fieldName + "` muss eine gültige E-Mail Adresse beinhalten";
        }
        return null;
    },
    equals: (field, value, object, args, options) => {
        // @ToDo: element.test -> Dot-Notation mit lodash erlauben

        if (object[field] !== object[args[1]]) {
            const fieldName = options && options.names && options.names[field] ? options.names[field] : field;
            const fieldName2 = options && options.names && options.names[args[1]] ? options.names[args[1]] : field;
            return "Das Feld `" + fieldName + "` stimmt nicht mit dem Feld `" + fieldName2 + "` überein";
        }
        return null;
    },
};

exports.fails = (object, rules, options) => {
    const fails = {};
    for (let i in rules) {
        const check = exports.valueFails(i, rules[i], object, options);
        if (check && check.length > 0) {
            fails[i] = check;
        }
    }
    return fails && Object.keys(fails).length > 0 ? fails : null;
};

exports.valueFails = (field, ruleString, object, options) => {
    const value = lodash.get(object, field);

    let fails = [];
    const rules = ruleString.split("|");
    if (rules && rules.length > 0) {
        for (let i in rules) {
            const args = rules[i].split(":");
            const check = validatorRules[args[0]](field, value, object, args, options);
            if (check && check.trim() !== "") {
                fails.push(check);
            }
        }
    }

    return fails && fails.length > 0 ? fails : null;
};
