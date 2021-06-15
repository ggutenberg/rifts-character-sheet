// These are some Skills

function updateSkill(rowId) {
  const row = `repeating_skills_${rowId}`;
  const skillAttrs = SKILL_KEYS.map((key) => `${row}_${key}`);
  console.log(skillAttrs);
  getAttrs(skillAttrs, (a) => {
    console.log(a);
    const attrs = {};
    const total =
      +a[`${row}_base`] +
      +a[`${row}_bonus`] +
      (+a[`${row}_skilllevel`] - 1) * +a[`${row}_perlevel`];
    console.log(total);
    attrs[`${row}_total`] = total;
    setAttrs(attrs);
  });
}

on("change:repeating_skills", (e) => {
  console.log(e);
  const [r, section, rowId] = e.triggerName.split("_");
  const row = `${r}_${section}_${rowId}`;
  getAttrs(["level"], (a) => {
    console.log(a);
    const attrs = { repeating_skills_skilllevel: a.level };
    console.log(attrs);
    setAttrs(attrs, {}, () => updateSkill(rowId));
  });
});
