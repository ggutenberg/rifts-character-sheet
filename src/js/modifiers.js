/**
 * User adds a thing to repeating_modifiers
 * -> addModifierToBonuses
 * -> triggers "change:repeating_bonuses:name"
 * -> addBonusToSelections
 */

async function addModifierToBonusesAsync(section, rowId) {
  console.log("addModifierToBonusesAsync", section, rowId);
  if (!section || !rowId) {
    return;
  }

  const thingBonusId = `repeating_${section}_${rowId}_bonus_id`;
  const thingAttrs = COMBAT_SAVE_KEYS.map(
    (key) => `repeating_${section}_${rowId}_${key}`
  );
  thingAttrs.push(thingBonusId);
  const a = await getAttrsAsync(thingAttrs);
  console.log(a);
  const attrs = {};
  let bonusRowId;
  if (a[thingBonusId]) {
    bonusRowId = a[thingBonusId];
  } else {
    bonusRowId = generateRowID();
    attrs[thingBonusId] = bonusRowId;
  }
  COMBAT_SAVE_KEYS.forEach((key) => {
    attrs[`repeating_bonuses_${bonusRowId}_${key}`] =
      a[`repeating_${section}_${rowId}_${key}`] || 0;
  });
  await setAttrsAsync(attrs);
}

on(
  "change:repeating_modifiers \
  change:repeating_abilities \
  change:repeating_magic \
  change:repeating_psionics",
  async (e) => {
    console.log("change:repeating_modifiers", e);
    const sourceParts = e.sourceAttribute.split("_");
    if (
      e.sourceAttribute.endsWith("_bonus_id") ||
      e.sourceAttribute.endsWith("_rowid") ||
      e.sourceAttribute.endsWith("_addtobonuses") ||
      sourceParts.length < 4
    ) {
      return;
    }
    const [r, section, rowId] = sourceParts;
    await setAttrsAsync({
      [`${r}_${section}_rowid`]: `${r}_${section}_${rowId}_`,
    });
    await addModifierToBonusesAsync(section, rowId);
  }
);

on("remove:repeating_modifiers", (e) => {
  console.log("remove:repeating_modifiers", e);
  // remove repeating_bonusselections row with the same index
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  removeBonusRows(bonusRowId);
});
