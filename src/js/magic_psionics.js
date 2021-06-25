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
  ["magic", "psionics"].forEach((section) => {
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

on(
  "change:repeating_magic:damage_starting \
  change:repeating_magic:damage_per_level \
  change:repeating_magic:damage_unit \
  change:repeating_psionics:damage_starting \
  change:repeating_psionics:damage_per_level \
  change:repeating_psionics:damage_unit",
  (e) => {
    console.log(e);
    const [r, section] = e.sourceAttribute.split("_");
    const row = `${r}_${section}_damage`;
    calculateDamage(row);
  }
);

on(
  "change:repeating_magic:percentage_starting \
  change:repeating_magic:percentage_per_level \
  change:repeating_psionics:percentage_starting \
  change:repeating_psionics:percentage_per_level",
  (e) => {
    console.log(e);
    const [r, section] = e.sourceAttribute.split("_");
    const row = `${r}_${section}_percentage`;
    calculatePercentage(row);
  }
);
on(
  "change:repeating_magic:duration_starting \
  change:repeating_magic:duration_per_level \
  change:repeating_magic:duration_unit \
  change:repeating_psionics:duration_starting \
  change:repeating_psionics:duration_per_level \
  change:repeating_psionics:duration_unit",
  (e) => {
    console.log(e);
    const [r, section] = e.sourceAttribute.split("_");
    const row = `${r}_${section}_duration`;
    calculateRangeDuration(row);
  }
);

on(
  "change:repeating_magic:range_starting \
  change:repeating_magic:range_per_level \
  change:repeating_magic:range_unit \
  change:repeating_psionics:range_starting \
  change:repeating_psionics:range_per_level \
  change:repeating_psionics:range_unit",
  (e) => {
    console.log(e);
    const [r, section] = e.sourceAttribute.split("_");
    const row = `${r}_${section}_range`;
    calculateRangeDuration(row);
  }
);

on(
  "change:repeating_magic:dc_starting \
  change:repeating_magic:dc_per_level \
  change:repeating_magic:dc_unit \
  change:repeating_psionics:dc_starting \
  change:repeating_psionics:dc_per_level \
  change:repeating_psionics:dc_unit",
  (e) => {
    console.log(e);
    const [r, section] = e.sourceAttribute.split("_");
    const row = `${r}_${section}_dc`;
    calculateRangeDuration(row);
  }
);

on("change:repeating_magic:name change:repeating_psionics:name", (e) => {
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const attrs = {};
  attrs[`${r}_${section}_rowid`] = `${r}_${section}_${rowId}_`;
  setAttrs(attrs);
});
