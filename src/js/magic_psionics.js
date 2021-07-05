on("clicked:repeating_magic:usespell", (e) => {
  console.log(e);
  getAttrs(["repeating_magic_ppe", "currentppe"], (a) => {
    console.log(a);
    setAttrs({ currentppe: a.currentppe - a.repeating_magic_ppe });
  });
});

on("clicked:resetppe", (e) => {
  console.log(e);
  getAttrs(["character_ppe"], (a) => {
    setAttrs({ currentppe: a.character_ppe });
  });
});

on("clicked:repeating_psionics:usepsionic", (e) => {
  console.log(e);
  getAttrs(["repeating_psionics_isp", "currentisp"], (a) => {
    console.log(a);
    setAttrs({ currentisp: a.currentisp - a.repeating_psionics_isp });
  });
});

on("clicked:resetisp", (e) => {
  console.log(e);
  getAttrs(["character_isp"], (a) => {
    setAttrs({ currentisp: a.character_isp });
  });
});

function calculateRangeDuration(row) {
  const attrNames = ["starting", "per_level", "unit"].map(
    (subProp) => `${row}_${subProp}`
  );
  console.log(attrNames);
  getAttrs(attrNames.concat(["character_level"]), (a) => {
    console.log(a);
    const value =
      +a[`${row}_starting`] + (+a.character_level - 1) * +a[`${row}_per_level`];
    const unit = a[`${row}_unit`];
    const valueWithUnits = `${value} ${unit}`;
    setAttrs({ [row]: valueWithUnits });
  });
}

function calculatePercentage(row) {
  const attrNames = ["starting", "per_level"].map(
    (subProp) => `${row}_${subProp}`
  );
  getAttrs(attrNames.concat(["character_level"]), (a) => {
    console.log(a);
    const value =
      +a[`${row}_starting`] + (+a.character_level - 1) * +a[`${row}_per_level`];
    setAttrs({ [row]: value });
  });
}

function calculateDamage(row) {
  const attrNames = ["starting", "per_level", "unit"].map(
    (subProp) => `${row}_${subProp}`
  );
  getAttrs(attrNames.concat(["character_level"]), (a) => {
    console.log(a);
    const perLevel = a[`${row}_per_level`];
    const repeats = perLevel
      ? `+${perLevel}`.repeat(a.character_level - 1)
      : "";
    const value = `${a[`${row}_starting`]}${repeats}`;
    setAttrs({ [row]: value });
  });
}

function updateMagicPsionicsLevels() {
  ABILITIES_REPEATERS.forEach((section) => {
    getSectionIDs(section, (ids) => {
      ids.forEach((id) => {
        const row = `repeating_${section}_${id}`;
        calculateDamage(`${row}_damage`);
        calculatePercentage(`${row}_percentage`);
        calculateRangeDuration(`${row}_range`);
        calculateRangeDuration(`${row}_duration`);
      });
    });
  });
}

const nameListeners = ABILITIES_REPEATERS.map(
  (repeater) => `change:repeating_${repeater}:name`
).join(" ");

const damageListeners = ABILITIES_REPEATERS.reduce((acc, cur) => {
  acc.push(`change:repeating_${cur}:damage_starting`);
  acc.push(`change:repeating_${cur}:damage_unit`);
  acc.push(`change:repeating_${cur}:damage_per_level`);
  return acc;
}, []).join(" ");

const percentageListeners = ABILITIES_REPEATERS.reduce((acc, cur) => {
  acc.push(`change:repeating_${cur}:percentage_starting`);
  acc.push(`change:repeating_${cur}:percentage_per_level`);
  return acc;
}, []).join(" ");

const rangeDurationFrequencyDcListeners = ABILITIES_REPEATERS.reduce(
  (acc, cur) => {
    ["range", "duration", "frequency", "dc"].forEach((property) => {
      acc.push(`change:repeating_${cur}:${property}_starting`);
      acc.push(`change:repeating_${cur}:${property}_unit`);
      acc.push(`change:repeating_${cur}:${property}_per_level`);
    });
    return acc;
  },
  []
).join(" ");

on(damageListeners, (e) => {
  console.log(e);
  const [r, section] = e.sourceAttribute.split("_");
  const row = `${r}_${section}_damage`;
  calculateDamage(row);
});

on(percentageListeners, (e) => {
  console.log(e);
  const [r, section] = e.sourceAttribute.split("_");
  const row = `${r}_${section}_percentage`;
  calculatePercentage(row);
});

on(rangeDurationFrequencyDcListeners, (e) => {
  console.log(e);
  const [r, section, rowId, property] = e.sourceAttribute.split("_");
  const row = `${r}_${section}_${property}`;
  calculateRangeDuration(row);
});

on(nameListeners, (e) => {
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const attrs = {};
  attrs[`${r}_${section}_rowid`] = `${r}_${section}_${rowId}_`;
  setAttrs(attrs);
});

on("change:repeating_abilities:addtobonuses", async (e) => {
  console.log("change:repeating_abilities:addtobonuses", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const enabled = Boolean(Number(e.newValue));
  if (enabled) {
    addModifierToBonusesAsync(section, rowId);
  } else {
    const a = await getAttrsAsync([`${r}_${section}_${rowId}_bonus_id`]);
    await removeBonusRowsAsync(a[`${r}_${section}_${rowId}_bonus_id`]);
  }
});

on("clicked:repeating_abilities:addtobonuses", async (e) => {
  console.log("clicked:repeating_abilities:addtobonuses", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  await addModifierToBonusesAsync(section, rowId);
});

on("clicked:repeating_abilities:removefrombonuses", async (e) => {
  console.log("clicked:repeating_abilities:removefrombonuses", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const a = await getAttrsAsync([`${r}_${section}_${rowId}_bonus_id`]);
  await removeBonusRowsAsync(a[`${r}_${section}_${rowId}_bonus_id`]);
});
