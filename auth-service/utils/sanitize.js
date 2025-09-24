const validator = require("validator");
const sanitizeHtml = require("sanitize-html");

const sanitizeInput = (value, type = "string") => {
  if (typeof value !== "string") return value;

  let clean = sanitizeHtml(value, {
    allowedTags: [],   // strip all HTML
    allowedAttributes: {},
  });

  switch (type) {
    case "email":
      return validator.isEmail(clean) ? validator.normalizeEmail(clean) : "";
    case "date":
      return validator.isDate(clean) ? clean : "";
    case "mobile":
      return validator.isMobilePhone(clean, "any") ? clean : "";
    default:
      return validator.escape(clean); // encode < > & " '
  }
};

module.exports = { sanitizeInput };
