on("change:repeating_profiles:bonus_ids", (e) => {
  console.log("change:repeating_profiles:bonus_ids", e);
  const bonusIds = e.newValue.split(",");
  const bonusNameKeys = bonusIds.map((id) => `repeating_bonuses_${id}_name`);
  getAttrs(bonusNameKeys, (a) => {
    const names = Object.values(a).reduce((acc, cur) => `${acc} ${cur}`, "");
    setAttrs({ repeating_profiles_bonus_names: names });
  });
});

on("clicked:repeating_profiles:copybonusids", (e) => {
  console.log("clicked:copybonusids", e);
  getAttrs(["bonus_ids_output"], (a) => {
    const attrs = {};
    attrs[`repeating_profiles_bonus_ids`] = a.bonus_ids_output;
    setAttrs(attrs);
  });
});

on("clicked:repeating_profiles:updateprofile", async (e) => {
  console.log("clicked:repeating_profiles:updateprofile", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const bonusIds = (
    await getAttrsAsync(["repeating_profiles_bonus_ids"])
  ).repeating_profiles_bonus_ids.split(",");
  console.log(bonusIds);
  await combineBonuses(bonusIds, `repeating_profiles_${rowId}`);
});
