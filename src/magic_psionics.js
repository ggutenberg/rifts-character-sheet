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

function calculateMagicRangeDuration(prop) {
  const row = `repeating_magic_${prop}`;
  const attrNames = ["starting", "per_level", "unit"].map(
    (subProp) => `${row}_${subProp}`
  );
  getAttrs(attrNames.concat(["level"]), (a) => {
    console.log(a);
    const value =
      +a[`${row}_starting`] + (+a.level - 1) * +a[`${row}_per_level`];
    const unit = a[`${row}_unit`];
    const valueWithUnits = `${value} ${unit}`;
    setAttrs({ [row]: valueWithUnits });
  });
}

function calculateMagicPercentage() {
  const row = "repeating_magic_percentage";
  const attrNames = ["starting", "per_level"].map(
    (subProp) => `${row}_${subProp}`
  );
  getAttrs(attrNames.concat(["level"]), (a) => {
    console.log(a);
    const value =
      +a[`${row}_starting`] + (+a.level - 1) * +a[`${row}_per_level`];
    setAttrs({ [row]: value });
  });
}

function calculateMagicDamage() {
  const row = "repeating_magic_damage";
  const attrNames = ["starting", "per_level", "unit"].map(
    (subProp) => `${row}_${subProp}`
  );
  getAttrs(attrNames.concat(["level"]), (a) => {
    console.log(a);
    const perLevel = a[`${row}_per_level`];
    const repeats = perLevel ? `+${perLevel}`.repeat(a.level - 1) : "";
    const value = `${a[`${row}_starting`]}${repeats}`;
    setAttrs({ [row]: value });
  });
}

on(
  "change:repeating_magic:damage_starting change:repeating_magic:damage_per_level change:repeating_magic:damage_unit",
  (e) => {
    console.log(e);
    calculateMagicDamage();
  }
);

on(
  "change:repeating_magic:percentage_starting change:repeating_magic:percentage_per_level",
  (e) => {
    console.log(e);
    calculateMagicPercentage();
  }
);
on(
  "change:repeating_magic:duration_starting change:repeating_magic:duration_per_level change:repeating_magic:duration_unit",
  (e) => {
    console.log(e);
    const prop = "duration";
    calculateMagicRangeDuration(prop);
  }
);

on(
  "change:repeating_magic:range_starting change:repeating_magic:range_per_level change:repeating_magic:range_unit",
  (e) => {
    console.log(e);
    const prop = "range";
    calculateMagicRangeDuration(prop);
  }
);
