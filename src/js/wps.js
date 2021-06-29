function addWpToBonuses(section, rowId, wpName) {
  console.log("addWpToBonuses", section, rowId);
  if (!section || !rowId || !wpName) {
    return;
  }
  const wpActions = WP_KEYS[section];
  const wpAttrs = wpActions.map(
    (action) => `repeating_${section}_${rowId}_${action}`
  );
  const wpCombatId = `repeating_${section}_${rowId}_bonus_id`;
  wpAttrs.push(wpCombatId);
  getAttrs(wpAttrs, (a) => {
    const attrs = {};
    let combatRowId;
    if (a[wpCombatId]) {
      combatRowId = a[wpCombatId];
    } else {
      combatRowId = generateRowID();
      attrs[wpCombatId] = combatRowId;
    }
    COMBAT_SAVE_KEYS.forEach((key) => {
      attrs[`repeating_bonuses_${combatRowId}_${key}`] =
        a[`repeating_${section}_${rowId}_${key}`] || 0;
    });
    setAttrs(attrs);
  });
}

function setWpRow(section, name, keyPrefix, level) {
  console.log("setWpRow", name, keyPrefix, level);
  const attrs = {};
  const levelBonuses = WP[name.toLowerCase()].slice(0, level);
  const totalBonuses = mergeAndAddObjects(levelBonuses);
  WP_KEYS[section].forEach((action) => {
    if (action == "name") return; // kick out on name
    const key = `${keyPrefix}_${action}`;
    attrs[key] = action in totalBonuses ? totalBonuses[action] : 0;
  });
  attrs[`${keyPrefix}_level`] = level;
  setAttrs(attrs);
}

function setWp({
  section,
  wpName,
  newCharacterLevel,
  oldCharacterLevel,
  newWpLevel,
  rowId,
  callback,
}) {
  console.log("setWp", {
    section,
    wpName,
    newCharacterLevel,
    oldCharacterLevel,
    newWpLevel,
    rowId,
    callback,
  });
  const keyPrefix = rowId
    ? `repeating_${section}_${rowId}`
    : `repeating_${section}`;
  if (newWpLevel) {
    setWpRow(section, wpName, keyPrefix, newWpLevel);
    if (callback) {
      callback(section, rowId, wpName);
    }
  } else if (!rowId) {
    setWpRow(section, wpName, keyPrefix, newCharacterLevel);
    if (callback) {
      callback(section, rowId, wpName);
    }
  } else {
    getAttrs([`${keyPrefix}_level`], (a) => {
      const oldWpLevel = a[`${keyPrefix}_level`];
      if (oldCharacterLevel) {
        const delta = oldCharacterLevel - oldWpLevel;
        if (delta != 0) {
          newWpLevel = newCharacterLevel - delta;
          setWpRow(section, wpName, keyPrefix, newWpLevel);
        } else {
          setWpRow(section, wpName, keyPrefix, newCharacterLevel);
        }
      } else {
        setWpRow(section, wpName, keyPrefix, newCharacterLevel);
      }
      if (callback) {
        callback(section, rowId, wpName);
      }
    });
  }
}

function updateWeaponProficiencies(
  section,
  newCharacterLevel,
  oldCharacterLevel
) {
  getSectionIDs(section, (ids) => {
    const attrNames = ids.map((id) => `repeating_${section}_${id}_name`);
    getAttrs(attrNames, (a) => {
      ids.forEach((id) => {
        setWp({
          section,
          wpName: a[`repeating_${section}_${id}_name`].toLowerCase(),
          newCharacterLevel,
          oldCharacterLevel,
          rowId: id,
        });
      });
    });
  });
}

function updateWeaponProficiency(section, source, newWpLevel) {
  getSectionIDs(section, (ids) => {
    const rowId = ids.find(
      (id) => `repeating_${section}_${id}_level`.toLowerCase() == source
    );
    getAttrs([`repeating_${section}_${rowId}_name`], (a) => {
      setWp({
        section,
        wpName: a[`repeating_${section}_${rowId}_name`],
        newWpLevel,
        rowId: rowId,
        callback: addWpToBonuses,
      });
    });
  });
}

on("change:repeating_wp:level change:repeating_wpmodern:level", (e) => {
  const section = e.sourceAttribute.split("_")[1];
  updateWeaponProficiency(section, e.sourceAttribute, e.newValue);
});

on("change:repeating_wp:name change:repeating_wpmodern:name", (e) => {
  console.log("change:repeating_wp:name change:repeating_wpmodern:name", e);
  const [r, section, rowId, attr] = e.sourceAttribute.split("_");
  const wpName = e.newValue.toLowerCase();
  const wpLevelKey = `repeating_${section}_level`;
  setAttrs({ [`repeating_${section}_rowid`]: `repeating_${section}_${rowId}` });
  getAttrs(["character_level", wpLevelKey], (a) => {
    if (Boolean(a[wpLevelKey]) && +a[wpLevelKey] != 0) {
      setWp({
        section,
        wpName,
        rowId,
        newWpLevel: a[wpLevelKey],
        callback: addWpToBonuses,
      });
    } else {
      const attrs = {};
      attrs[`repeating_${section}_level`] = a.character_level;
      setAttrs(attrs);
    }
  });
});
