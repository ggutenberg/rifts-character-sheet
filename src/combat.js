function setWpRow(section, name, keyPrefix, level) {
  console.log("setWpRow", name, keyPrefix, level);
  const attrs = {};
  const levelBonuses = WP[name.toLowerCase()].slice(0, level);
  const totalBonuses = mergeAndAddObjects(levelBonuses);
  WP_KEYS[section].forEach((action) => {
    if (action == "skill") return; // kick out on name
    const key = `${keyPrefix}_${action}`;
    attrs[key] = action in totalBonuses ? totalBonuses[action] : 0;
  });
  attrs[`${keyPrefix}_skill_level`] = level;
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
    getAttrs([`${keyPrefix}_skill_level`], (a) => {
      const oldWpLevel = a[`${keyPrefix}_skill_level`];
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
    const attrNames = ids.map((id) => `repeating_${section}_${id}_skill`);
    getAttrs(attrNames, (a) => {
      ids.forEach((id) => {
        setWp({
          section,
          wpName: a[`repeating_${section}_${id}_skill`].toLowerCase(),
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
      (id) => `repeating_${section}_${id}_skill_level`.toLowerCase() == source
    );
    getAttrs([`repeating_${section}_${rowId}_skill`], (a) => {
      setWp({
        section,
        wpName: a[`repeating_${section}_${rowId}_skill`],
        newWpLevel,
        rowId: rowId,
        callback: addWpToCombat,
      });
    });
  });
}

on(
  "change:repeating_wp:skill_level change:repeating_wpmodern:skill_level",
  (e) => {
    const section = e.sourceAttribute.split("_")[1];
    updateWeaponProficiency(section, e.sourceAttribute, e.newValue);
  }
);

on("change:repeating_wp:skill change:repeating_wpmodern:skill", (e) => {
  console.log("change:repeating_wp:skill change:repeating_wpmodern:skill", e);
  const [r, section, rowId, attr] = e.sourceAttribute.split("_");
  const wpName = e.newValue.toLowerCase();
  const wpLevelKey = `repeating_${section}_skill_level`;
  getAttrs(["level", wpLevelKey], (a) => {
    if (Boolean(a[wpLevelKey])) {
      setWp({
        section,
        wpName,
        rowId,
        newWpLevel: a[wpLevelKey],
        callback: addWpToCombat,
      });
    } else {
      const attrs = {};
      attrs[`repeating_${section}_skill_level`] = a.level;
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
      "combat_combined_burst",
    ],
    (a) => {
      setAttrs({
        combat_combined_strike_range_single:
          +a.combat_combined_strike_range +
          +a.combat_combined_strike_range_single,
        combat_combined_burst:
          +a.combat_combined_strike_range + +a.combat_combined_burst,
      });
    }
  );
}

function combineCombat(rowIds) {
  // we need to combine the values of each repeated attribute within
  // each of the sectionIds and aggregate them in the combined combat section
  // +PP +PS, and add a saving throws section with +ME +PE

  console.log("combineCombat", rowIds);
  repeatingStringConcat({
    destinations: ["combat_combined_damage"],
    section: "combat",
    fields: ["damage"],
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
    section: "combat",
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
      "combat_combined_burst",
    ],
    "combat",
    [
      "attacks",
      "initiative",
      "pull",
      "roll",
      "strike_range",
      "strike_range_single",
      "burst",
    ],
    `filter:${rowIds.toString()}`,
    {
      callback: addStrikeRangeToCombined,
    }
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
    ],
    "combat",
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
    ],
    `filter:${rowIds.toString()}`,
    "pp_bonus"
  );

  // Saving Throws
  Object.entries(SAVE_KEYS_ATTRIBUTE_BONUSES).forEach(
    ([attributeBonus, saves]) => {
      repeatingSum(
        saves.map((save) => `combat_combined_${save}`),
        "combat",
        saves,
        `filter:${rowIds.toString()}`,
        attributeBonus
      );
    }
  );
}

function addWpToCombat(section, rowId, wpName) {
  console.log("addWpToCombat", section, rowId);
  if (!section || !rowId || !wpName) {
    return;
  }
  const wpActions = WP_KEYS[section];
  const wpAttrs = wpActions.map(
    (action) => `repeating_${section}_${rowId}_${action}`
  );
  const wpCombatId = `repeating_${section}_${rowId}_combat_id`;
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
      attrs[`repeating_combat_${combatRowId}_${key}`] =
        a[`repeating_${section}_${rowId}_${key}`] || 0;
    });
    setAttrs(attrs);
  });
}

/**
 * This function assumes its indices match up with combatselections indices.
 * If that changes, it will need to be modified.
 * */
on("change:repeating_combat:skill", (e) => {
  console.log("change:repeating_combat:skill", e);
  const [r, section, combatRowId] = e.sourceAttribute.split("_");
  getSectionIDs("combat", (skillIds) => {
    getSectionIDs("combatselections", (selectionIds) => {
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
      // Store related row ID from repeating_combatselections
      attrs[`repeating_combat_rowid`] = `repeating_combat_${combatRowId}_`;
      attrs[`repeating_combat_combat_selection_id`] = rowId;
      attrs[`repeating_combatselections_${rowId}_combat_id`] =
        skillIds[skillIdx];
      attrs[`repeating_combatselections_${rowId}_skill`] = e.newValue;
      attrs[`repeating_combatselections_${rowId}_bonus_section`] = "combat";
      setAttrs(attrs);
    });
  });
});

on("remove:repeating_wp remove:repeating_wpmodern", (e) => {
  console.log("remove wp", e);
  // const [r, section, rowId] = e.sourceAttribute.split('_');
  const combatRowId = e.removedInfo[`${e.sourceAttribute}_combat_id`];
  const combatSelectionKey = `repeating_combat_${combatRowId}_combat_selection_id`;
  getAttrs([combatSelectionKey], (a) => {
    removeRepeatingRow(`repeating_combatselections_${a[combatSelectionKey]}`);
    removeRepeatingRow(`repeating_combat_${combatRowId}`);
    aggregateBonuses();
  });
});

on("remove:repeating_combat", (e) => {
  // remove repeating_combatselections row with the same index
  const combatselectionsRowIdToRemove =
    e.removedInfo[`${e.sourceAttribute}_combat_selection_id`];
  removeRepeatingRow(
    `repeating_combatselections_${combatselectionsRowIdToRemove}`
  );
  aggregateBonuses();
});

on("change:_reorder:combat", (e) => {
  // reorder repeating_combatselections to match
  console.log("change:_reorder:combat", e);
});

function aggregateBonuses() {
  getSectionIDs("combatselections", (ids) => {
    const checkboxNames = ids.map(
      (id) => `repeating_combatselections_${id}_skill_check`
    );
    const combatIdNames = ids.map(
      (id) => `repeating_combatselections_${id}_combat_id`
    );
    const bonusSectionNames = ids.map(
      (id) => `repeating_combatselections_${id}_bonus_section`
    );
    const attrNames = checkboxNames.concat(combatIdNames, bonusSectionNames);
    getAttrs(attrNames, (a) => {
      const combatRowIds = ids.reduce((acc, id) => {
        const prefix = `repeating_combatselections_${id}`;
        if (Boolean(Number(a[`${prefix}_skill_check`])) == true) {
          acc.push(a[`${prefix}_combat_id`]);
        }
        return acc;
      }, []);
      combineCombat(combatRowIds);
    });
  });
}

on(
  "change:repeating_combatselections:skill_check change:repeating_combat",
  (e) => {
    console.log(
      "change:repeating_combatselections:skill_check change:repeating_combat",
      e
    );
    aggregateBonuses();
  }
);
