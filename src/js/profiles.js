on("change:repeating_profiles:bonus_ids", (e) => {
  console.log("change:repeating_profiles:bonus_ids", e);
  const bonusIds = e.newValue.split(",");
  const bonusNameKeys = bonusIds.map((id) => `repeating_bonuses_${id}_name`);
  getAttrs(bonusNameKeys, (a) => {
    console.log(a);
    const names = Object.values(a).reduce((acc, cur) => `${acc} ${cur}`, "");
    setAttrs({ repeating_profiles_bonus_names: names });
  });
  //   setAttrs({ repeating_profiles_bonus_names: "abc" });
});
