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
