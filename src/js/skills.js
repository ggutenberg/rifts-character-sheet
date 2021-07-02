async function updateSkill(rowId, iqBonusKey = "iq_bonus") {
  const row = `repeating_skills_${rowId}`;
  const skillAttrs = SKILL_KEYS.map((key) => `${row}_${key}`);
  console.log(skillAttrs);
  const a = await getAttrsAsync(skillAttrs.concat([iqBonusKey]));
  console.log(a);
  const attrs = {};
  const total =
    +a[`${row}_base`] +
    +a[iqBonusKey] +
    +a[`${row}_bonus`] +
    (+a[`${row}_level`] - 1) * +a[`${row}_perlevel`];
  console.log(total);
  attrs[`${row}_total`] = total;
  await setAttrsAsync(attrs);
}

async function updateSkills() {
  const ids = await getSectionIDsAsync("skills");
  for (const id of ids) {
    await updateSkill(id);
  }
}

function updateSkillLevels(newCharacterLevel, oldCharacterLevel) {
  const delta = newCharacterLevel - oldCharacterLevel;
  getSectionIDs("skills", (ids) => {
    const attrNames = ids.map((id) => `repeating_skills_${id}_level`);
    getAttrs(attrNames, (a) => {
      const attrs = {};
      ids.forEach((id) => {
        attrs[`repeating_skills_${id}_level`] =
          +a[`repeating_skills_${id}_level`] + delta;
      });
      setAttrs(attrs);
    });
  });
}

on("change:repeating_skills", (e) => {
  console.log("change:repeating_skills", e);
  if (e.sourceAttribute.endsWith("_name")) return;
  const sourceParts = e.sourceAttribute.split("_");
  // Return if no attribute is changed and it's the row itself
  if (sourceParts.length < 4) return;
  const [r, section, rowId] = sourceParts;
  updateSkill(rowId);
});

on("change:repeating_skills:name", (e) => {
  const [r, section, rowId, attr] = e.sourceAttribute.split("_");
  getAttrs(["character_level"], (a) => {
    console.log(a);
    const attrs = {
      repeating_skills_level: a.character_level,
      [`repeating_${section}_rowid`]: `repeating_${section}_${rowId}`,
    };
    console.log(attrs);
    setAttrs(attrs);
  });
});
