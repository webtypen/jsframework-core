exports.slug = (string) => {
    string = (string + "").toLowerCase();
    string = string.replace(new RegExp("  ", "g"), " ");
    string = string.replace(new RegExp("  ", "g"), " ");
    string = string.replace(new RegExp(" ", "g"), "-");

    const replacements = {
        Ä: "AE",
        ä: "ae",
        Ö: "OE",
        ö: "oe",
        Ü: "UE",
        ü: "ue",
        Đ: "D",
        đ: "d",
        "&": "and",
        "€": "euro",
        "<": "less",
        ">": "greater",
    };
    for (let i in replacements) {
        string = string.replace(new RegExp(i, "g"), replacements[i]);
    }

    return string.trim();
};

exports.random = (length) => {
    const result = [];
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
    }
    return result.join("");
};

