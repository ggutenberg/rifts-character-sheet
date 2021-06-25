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

on("change:combat_combined_attacks", (e) => {
  getAttrs(["run_ft_melee"], (a) => {
    setAttrs({ run_ft_attack: Math.round(a.run_ft_melee / e.newValue) });
  });
  getSectionIDs("movement", (ids) => {
    const attrNames = ids.map(
      (id) => `repeating_movement_${id}_movement_ft_melee`
    );
    getAttrs(attrNames, (a) => {
      const attrs = {};
      ids.forEach((id) => {
        const row = `repeating_movement_${id}`;
        const feetPerMelee = a[`${row}_movement_ft_melee`] || 0;
        if (feetPerMelee) {
          attrs[`${row}_movement_ft_attack`] = Math.round(
            feetPerMelee / e.newValue
          );
        }
      });
      setAttrs(attrs);
    });
  });
});

function addStrikeRangeToCombined() {
  getAttrs(
    [
      "combat_combined_strike_range",
      "combat_combined_strike_range_single",
      "combat_combined_strike_range_burst",
      "combat_combined_strike_range_aimed",
      "combat_combined_strike_range_called",
    ],
    (a) => {
      const strikeRangeSingle =
        +a.combat_combined_strike_range +
        +a.combat_combined_strike_range_single;
      const strikeRangeBurst =
        +a.combat_combined_strike_range + +a.combat_combined_strike_range_burst;
      const strikeRangeAimedSingle =
        strikeRangeSingle + +a.combat_combined_strike_range_aimed + 2;
      const strikeRangeAimedPulse = Math.floor(strikeRangeAimedSingle / 2);
      const strikeRangeCalledSingle =
        strikeRangeSingle + a.combat_combined_strike_range_called;
      const strikeRangeCalledPulse = Math.floor(strikeRangeCalledSingle / 2);
      const strikeRangeAimedCalledSingle =
        strikeRangeAimedSingle + +a.combat_combined_strike_range_called;
      const strikeRangeAimedCalledPulse = Math.floor(
        strikeRangeAimedCalledSingle / 2
      );

      setAttrs({
        combat_combined_strike_range_single: strikeRangeSingle,
        combat_combined_strike_range_burst: strikeRangeBurst,
        combat_combined_strike_range_aimed_single: strikeRangeAimedSingle,
        combat_combined_strike_range_aimed_pulse: strikeRangeAimedPulse,
        combat_combined_strike_range_called_single: strikeRangeCalledSingle,
        combat_combined_strike_range_called_pulse: strikeRangeCalledPulse,
        combat_combined_strike_range_aimed_called_single:
          strikeRangeAimedCalledSingle,
        combat_combined_strike_range_aimed_called_pulse:
          strikeRangeAimedCalledPulse,
      });
    }
  );
}

function combineCombat(rowIds) {
  // we need to combine the values of each repeated attribute within
  // each of the sectionIds and aggregate them in the combined combat section
  // +PP +PS, and add a saving throws section with +ME +PE

  repeatingStringConcat({
    destinations: ["combat_combined_damage", "combat_combined_damage_range"],
    section: "bonuses",
    fields: ["damage", "damage_range"],
    filter: rowIds,
    callback: () => {
      console.log("repeatingStringConcat callback");
    },
  });

  repeatingPickBest({
    destinations: [
      "combat_combined_critical",
      "combat_combined_knockout",
      "combat_combined_deathblow",
    ],
    section: "bonuses",
    fields: ["critical", "knockout", "deathblow"],
    defaultValues: [20, 0, 0],
    ranks: ["low", "low", "low"],
    filter: rowIds,
    callback: () => {
      console.log("repeatingPickBest callback");
    },
  });

  // No attribute bonuses.
  repeatingSum(
    [
      "combat_combined_attacks",
      "combat_combined_initiative",
      "combat_combined_pull",
      "combat_combined_roll",
      "combat_combined_strike_range",
      "combat_combined_strike_range_single",
      "combat_combined_strike_range_burst",
      "combat_combined_strike_range_aimed",
      "combat_combined_strike_range_called",
    ],
    "bonuses",
    [
      "attacks",
      "initiative",
      "pull",
      "roll",
      "strike_range",
      "strike_range_single",
      "strike_range_burst",
      "strike_range_aimed",
      "strike_range_called",
    ],
    `filter:${rowIds.toString()}`,
    {
      callback: addStrikeRangeToCombined,
    }
  );

  repeatingSum(
    ["combat_combined_sdc"],
    "bonuses",
    ["sdc"],
    `filter:${rowIds.toString()}`,
    "character_sdc"
  );

  repeatingSum(
    ["combat_combined_mdc"],
    "bonuses",
    ["mdc"],
    `filter:${rowIds.toString()}`,
    "character_mdc"
  );

  // PP Bonus
  repeatingSum(
    [
      "combat_combined_strike",
      "combat_combined_parry",
      "combat_combined_dodge",
      "combat_combined_throw",
      "combat_combined_disarm",
      "combat_combined_entangle",
      "combat_combined_dodge_flight",
      "combat_combined_dodge_auto",
      "combat_combined_dodge_teleport",
      "combat_combined_dodge_motion",
      "combat_combined_flipthrow",
    ],
    "bonuses",
    [
      "strike",
      "parry",
      "dodge",
      "throw",
      "disarm",
      "entangle",
      "dodge_flight",
      "dodge_auto",
      "dodge_teleport",
      "dodge_motion",
      "flipthrow",
    ],
    `filter:${rowIds.toString()}`,
    "pp_bonus"
  );

  // Saving Throws
  Object.entries(SAVE_KEYS_ATTRIBUTE_BONUSES).forEach(
    ([attributeBonus, saves]) => {
      const destinations = saves.map((save) => `combat_combined_${save}`);
      const section = "bonuses";
      const fields = saves;
      repeatingSum(
        destinations,
        section,
        fields,
        `filter:${rowIds.toString()}`,
        attributeBonus
      );
    }
  );
}

function addThingToBonuses(section, rowId) {
  console.log("addThingToBonuses", section, rowId);
  if (!section || !rowId) {
    return;
  }

  const thingBonusId = `repeating_${section}_${rowId}_bonus_id`;
  const thingAttrs = COMBAT_SAVE_KEYS.map(
    (key) => `repeating_${section}_${rowId}_${key}`
  );
  thingAttrs.push(thingBonusId);
  getAttrs(thingAttrs, (a) => {
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
    setAttrs(attrs);
  });
}

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

on("change:repeating_combat", (e) => {
  console.log("change:repeating_combat", e);
  const sourceParts = e.sourceAttribute.split("_");
  if (e.sourceAttribute.endsWith("_bonus_id") || sourceParts.length < 4) return;
  const [r, section, rowId] = sourceParts;
  addThingToBonuses(section, rowId);
  setAttrs({ [`repeating_combat_rowid`]: `repeating_combat_${rowId}_` });
});

/**
 * This function assumes its indices match up with bonusselections indices.
 * If that changes, it will need to be modified.
 * */
on("change:repeating_bonuses:name", (e) => {
  console.log("change:repeating_bonuses:name", e);
  const [r, section, combatRowId] = e.sourceAttribute.split("_");
  getSectionIDs("bonuses", (skillIds) => {
    getSectionIDs("bonusselections", (selectionIds) => {
      const skillIdx = skillIds.findIndex((id) =>
        e.sourceAttribute.includes(id)
      );
      const attrs = {};
      let rowId;
      if (skillIdx >= selectionIds.length) {
        // add new row
        rowId = generateRowID();
      } else {
        // use existing row
        rowId = selectionIds[skillIdx];
      }
      // Store related row ID from repeating_bonusselections
      attrs[`repeating_bonuses_rowid`] = `repeating_bonuses_${combatRowId}_`;
      attrs[`repeating_bonuses_bonus_selection_id`] = rowId;
      attrs[`repeating_bonusselections_${rowId}_bonus_id`] = skillIds[skillIdx];
      attrs[`repeating_bonusselections_${rowId}_name`] = e.newValue;
      attrs[`repeating_bonusselections_${rowId}_bonus_section`] = "bonuses";
      setAttrs(attrs);
    });
  });
});

function removeBonusSelectionsRow(bonusRowId, callback = null) {
  getAttrs([`repeating_bonuses_${bonusRowId}_bonus_selection_id`], (a) => {
    removeRepeatingRow(
      `repeating_bonusselections_${
        a[`repeating_bonuses_${bonusRowId}_bonus_selection_id`]
      }`
    );
    aggregateBonuses();
    if (typeof callback == "function") {
      callback();
    }
  });
}

function removeBonusRows(bonusRowId, callback = null) {
  removeBonusSelectionsRow(bonusRowId, () => {
    removeRepeatingRow(`repeating_bonuses_${bonusRowId}`);
    if (typeof callback == "function") {
      callback();
    }
  });
}

on("remove:repeating_wp remove:repeating_wpmodern", (e) => {
  console.log("remove wp", e);
  // const [r, section, rowId] = e.sourceAttribute.split('_');
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  removeBonusRows(bonusRowId);
});

on("remove:repeating_combat", (e) => {
  console.log("remove:repeating_combat", e);
  // remove repeating_bonusselections row with the same index
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  removeBonusRows(bonusRowId);
});

on("remove:repeating_bonuses", (e) => {
  console.log("remove:repeating_bonuses", e);
  // remove repeating_selections row with the same index
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  removeBonusSelectionsRow(bonusRowId);
});

on("change:_reorder:combat", (e) => {
  // reorder repeating_bonusselections to match
  console.log("change:_reorder:combat", e);
});

function aggregateBonuses() {
  console.log("aggregateBonuses");
  getSectionIDs("bonusselections", (ids) => {
    const checkboxNames = ids.map(
      (id) => `repeating_bonusselections_${id}_enabled`
    );
    const combatIdNames = ids.map(
      (id) => `repeating_bonusselections_${id}_bonus_id`
    );
    const bonusSectionNames = ids.map(
      (id) => `repeating_bonusselections_${id}_bonus_section`
    );
    const attrNames = checkboxNames.concat(combatIdNames, bonusSectionNames);
    getAttrs(attrNames, (a) => {
      console.log(a);
      const combatRowIds = ids.reduce((acc, id) => {
        const prefix = `repeating_bonusselections_${id}`;
        if (Boolean(Number(a[`${prefix}_enabled`])) == true) {
          acc.push(a[`${prefix}_bonus_id`]);
        }
        return acc;
      }, []);
      combineCombat(combatRowIds);
    });
  });
}

on("change:repeating_bonusselections:enabled change:repeating_bonuses", (e) => {
  console.log(
    "change:repeating_bonusselections:enabled change:repeating_bonuses",
    e
  );
  aggregateBonuses();
});
