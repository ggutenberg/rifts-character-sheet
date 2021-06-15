function repeatingSum(destinations, section, fields, ...extras) {
  const isNumber = (value) => parseFloat(value).toString() === value.toString();
  const isOption = (value) =>
    [...checks.valid, ...checks.roundtypes].includes(value);
  const isRounding = (value) => checks.roundtypes.includes(value);
  const isFraction = (value) =>
    value.includes("/") && !(value.includes(",") || value.includes("|"));
  const getTrimmed = (value) => value.toLowerCase().replace(/\s/g, "");
  const getRounded = (type, value, pow) =>
    (Math[type](value * Math.pow(10, pow)) / Math.pow(10, pow)).toFixed(
      Math.max(0, pow)
    );
  const getFraction = (value /*{ console.log(`value: ${value}`); */) =>
    parseInt(value.split("/")[0]) / parseInt(value.split("/")[1]);
  const getMultiplier = (value, rounding = 1) =>
    "undefined" === typeof value
      ? rounding
        ? 0
        : 1
      : isNumber(value)
      ? parseFloat(value)
      : isFraction(value)
      ? getFraction(value)
      : value;
  if (!Array.isArray(destinations)) destinations = [getTrimmed(destinations)];
  if (!Array.isArray(fields)) fields = [getTrimmed(fields)];
  const fields_trimmed = fields.map((field) => getTrimmed(field).split(":")[0]);
  const subfields = fields_trimmed.slice(0, destinations.length);
  const checks = {
    valid: ["multiplier"],
    roundtypes: ["ceil", "round", "floor"],
  };
  let properties = { attributes: {}, options: {} };
  extras.forEach((extra) => {
    const [prop, v] = getTrimmed(extra).split(":");
    const multiplier_maybe = getMultiplier(v, isRounding(prop));
    const obj = isNumber(multiplier_maybe)
      ? subfields.reduce((obj, field) => {
          obj[field] = multiplier_maybe;
          return obj;
        }, {})
      : multiplier_maybe.split(",").reduce((obj, item) => {
          const [stat, value] = item.split("|");
          const multiplier = getMultiplier(value, isRounding(prop));
          obj[stat] = multiplier;
          return obj;
        }, {});
    properties[isOption(prop) ? "options" : "attributes"][prop] = obj;
  });
  getSectionIDs(`repeating_${section}`, (idArray) => {
    const attrArray = idArray.reduce(
      (m, id) => [
        ...m,
        ...fields_trimmed.map((field) => `repeating_${section}_${id}_${field}`),
      ],
      []
    );
    console.log("attrArray", attrArray);
    console.log(properties.attributes.filter);
    let filteredAttrArray = attrArray;
    if (properties.attributes.filter) {
      filteredAttrArray = attrArray.filter((attr) =>
        Object.keys(properties.attributes.filter).some(
          (sectionId) => sectionId && attr.includes(sectionId)
        )
      );
    }
    console.log("filteredAttrArray", filteredAttrArray);
    getAttrs(
      [...filteredAttrArray, ...Object.keys(properties.attributes)],
      (v) => {
        const getValue = (section, id, field) =>
          v[`repeating_${section}_${id}_${field}`] === "on"
            ? 1
            : parseFloat(v[`repeating_${section}_${id}_${field}`]) || 0;
        const commonMultipliers =
          fields.length <= destinations.length
            ? []
            : fields.splice(
                destinations.length,
                fields.length - destinations.length
              );
        const output = destinations.reduce((obj, destination, index) => {
          let sumTotal = idArray.reduce(
            (total, id) =>
              total +
              getValue(section, id, fields_trimmed[index]) *
                commonMultipliers.reduce(
                  (subtotal, mult) =>
                    subtotal *
                    (!mult.includes(":") ||
                    mult
                      .split(":")[1]
                      .split(",")
                      .includes(fields_trimmed[index])
                      ? getValue(section, id, mult.split(":")[0])
                      : 1),
                  1
                ),
            0
          );
          sumTotal *=
            properties.options.hasOwnProperty("multiplier") &&
            Object.keys(properties.options.multiplier).includes(
              fields_trimmed[index]
            )
              ? parseFloat(
                  properties.options.multiplier[fields_trimmed[index]]
                ) || 0
              : 1;
          sumTotal += Object.entries(properties.attributes).reduce(
            (total, [key, value]) =>
              (total += value.hasOwnProperty(fields_trimmed[index])
                ? parseFloat(v[key] || 0) *
                  (parseFloat(value[fields_trimmed[index]]) || 1)
                : 0),
            0
          );
          checks.roundtypes.forEach((type) => {
            if (properties.options.hasOwnProperty(type)) {
              if (
                Object.keys(properties.options[type]).includes(
                  fields_trimmed[index]
                )
              ) {
                sumTotal = getRounded(
                  type,
                  sumTotal,
                  +properties.options[type][fields_trimmed[index]] || 0
                );
              } else if (
                properties.options[type] == "0" ||
                !isNaN(+properties.options[type] || "x")
              ) {
                sumTotal = getRounded(
                  type,
                  sumTotal,
                  +properties.options[type]
                );
              }
            }
          });
          obj[destination] = sumTotal;
          return obj;
        }, {});
        console.log(output);
        setAttrs(output);
      }
    );
  });
}

function getBiAttributeBonus(attr) {
  const bonus = attr > 15 ? Math.ceil((Math.min(attr, 30) - 15) / 2) : 0;
  return bonus;
}

function mergeAndAddObjects(data) {
  const result = {};
  data.forEach((obj) => {
    for (let [key, value] of Object.entries(obj)) {
      if (result[key]) {
        result[key] += value;
      } else {
        result[key] = value;
      }
    }
  });
  return result;
}
