function updateSkill(rowId) {
  const row = `repeating_skills_${rowId}`;
  const skillAttrs = SKILL_KEYS.map((key) => `${row}_${key}`);
  console.log(skillAttrs);
  getAttrs(skillAttrs.concat(["iq_bonus"]), (a) => {
    console.log(a);
    const attrs = {};
    const total =
      +a[`${row}_base`] +
      +a["iq_bonus"] +
      +a[`${row}_bonus`] +
      (+a[`${row}_skilllevel`] - 1) * +a[`${row}_perlevel`];
    console.log(total);
    attrs[`${row}_total`] = total;
    setAttrs(attrs);
  });
}

function updateSkills() {
  getSectionIDs("skills", (ids) => {
    ids.forEach((id) => {
      updateSkill(id);
    });
  });
}

function updateSkillLevels(newCharacterLevel, oldCharacterLevel) {
  const delta = newCharacterLevel - oldCharacterLevel;
  getSectionIDs("skills", (ids) => {
    const attrNames = ids.map((id) => `repeating_skills_${id}_skilllevel`);
    getAttrs(attrNames, (a) => {
      const attrs = {};
      ids.forEach((id) => {
        attrs[`repeating_skills_${id}_skilllevel`] =
          +a[`repeating_skills_${id}_skilllevel`] + delta;
      });
      setAttrs(attrs);
    });
  });
}

on("change:repeating_skills", (e) => {
  if (e.sourceAttribute.endsWith("_skill")) return;
  console.log("skillevel", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  updateSkill(rowId);
});

on("change:repeating_skills:skill", (e) => {
  getAttrs(["character_level"], (a) => {
    console.log(a);
    const attrs = { repeating_skills_skilllevel: a.character_level };
    console.log(attrs);
    setAttrs(attrs);
  });
});
