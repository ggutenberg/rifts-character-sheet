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

async function addStrikeRangeToCombinedAsync(rowPrefix) {
  const a = await getAttrsAsync([
    `${rowPrefix}_strike_range`,
    `${rowPrefix}_strike_range_single`,
    `${rowPrefix}_strike_range_burst`,
    `${rowPrefix}_strike_range_aimed`,
    `${rowPrefix}_strike_range_called`,
  ]);
  const strikeRangeSingle =
    +a[`${rowPrefix}_strike_range`] + +a[`${rowPrefix}_strike_range_single`];
  const strikeRangeBurst =
    +a[`${rowPrefix}_strike_range`] + +a[`${rowPrefix}_strike_range_burst`];
  const strikeRangeAimedSingle =
    strikeRangeSingle + +a[`${rowPrefix}_strike_range_aimed`] + 2;
  const strikeRangeAimedPulse = Math.floor(strikeRangeAimedSingle / 2);
  const strikeRangeCalledSingle =
    strikeRangeSingle + a[`${rowPrefix}_strike_range_called`];
  const strikeRangeCalledPulse = Math.floor(strikeRangeCalledSingle / 2);
  const strikeRangeAimedCalledSingle =
    strikeRangeAimedSingle + +a[`${rowPrefix}_strike_range_called`];
  const strikeRangeAimedCalledPulse = Math.floor(
    strikeRangeAimedCalledSingle / 2
  );
  const attrs = {
    [`${rowPrefix}_strike_range_single`]: strikeRangeSingle,
    [`${rowPrefix}_strike_range_burst`]: strikeRangeBurst,
    [`${rowPrefix}_strike_range_aimed_single`]: strikeRangeAimedSingle,
    [`${rowPrefix}_strike_range_aimed_pulse`]: strikeRangeAimedPulse,
    [`${rowPrefix}_strike_range_called_single`]: strikeRangeCalledSingle,
    [`${rowPrefix}_strike_range_called_pulse`]: strikeRangeCalledPulse,
    [`${rowPrefix}_strike_range_aimed_called_single`]:
      strikeRangeAimedCalledSingle,
    [`${rowPrefix}_strike_range_aimed_called_pulse`]:
      strikeRangeAimedCalledPulse,
  };
  await setAttrsAsync(attrs);
}

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

async function combineBonuses(rowIds, destinationPrefix) {
  await repeatingStringConcatAsync({
    destinations: [
      `${destinationPrefix}_damage`,
      `${destinationPrefix}_damage_range`,
    ],
    section: "bonuses",
    fields: ["damage", "damage_range"],
    filter: rowIds,
  });

  const psType = (await getAttrsAsync(["character_ps_type"]))[
    "character_ps_type"
  ];
  await repeatingPickBestAsync({
    destinations: [
      `${destinationPrefix}_ar`,
      `${destinationPrefix}_hf`,
      `${destinationPrefix}_ps_type`,
      `${destinationPrefix}_critical`,
      `${destinationPrefix}_knockout`,
      `${destinationPrefix}_deathblow`,
    ],
    section: "bonuses",
    fields: ["ar", "hf", "ps_type", "critical", "knockout", "deathblow"],
    defaultValues: [0, 0, psType, 20, 0, 0],
    ranks: ["high", "high", "high", "low", "low", "low"],
    filter: rowIds,
  });

  // No attribute bonuses.
  await repeatingSumAsync(
    [
      `${destinationPrefix}_hp`,
      `${destinationPrefix}_sdc`,
      `${destinationPrefix}_mdc`,
      `${destinationPrefix}_ppe`,
      `${destinationPrefix}_isp`,
      `${destinationPrefix}_attacks`,
      `${destinationPrefix}_initiative`,
      `${destinationPrefix}_pull`,
      `${destinationPrefix}_roll`,
      `${destinationPrefix}_strike_range`,
      `${destinationPrefix}_strike_range_single`,
      `${destinationPrefix}_strike_range_burst`,
      `${destinationPrefix}_strike_range_aimed`,
      `${destinationPrefix}_strike_range_called`,
      `${destinationPrefix}_disarm_range`,
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
      "disarm_range",
    ],
    `filter:${rowIds.toString()}`
  );
  await addStrikeRangeToCombinedAsync(destinationPrefix);
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
      "combat_combined_disarm_range",
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
      "disarm_range",
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

function removeBonusSelectionsRow(bonusRowId, callback = null) {
  getAttrs([`repeating_bonuses_${bonusRowId}_selection_id`], (a) => {
    removeRepeatingRow(
      `repeating_bonusselections_${
        a[`repeating_bonuses_${bonusRowId}_selection_id`]
      }`
    );
    // aggregateBonuses();
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

on("remove:repeating_bonuses", (e) => {
  console.log("remove:repeating_bonuses", e);
  // remove repeating_selections row with the same index
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  // removeBonusSelectionsRow(bonusRowId);
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
    const bonusSectionNames = [];
    // const bonusSectionNames = ids.map(
    //   (id) => `repeating_bonusselections_${id}_bonus_section`
    // );
    const attrNames = checkboxNames.concat(combatIdNames, bonusSectionNames);
    getAttrs(attrNames, (a) => {
      console.log(a);
      const bonusRowIds = ids.reduce((acc, id) => {
        const prefix = `repeating_bonusselections_${id}`;
        if (Boolean(Number(a[`${prefix}_enabled`])) == true) {
          acc.push(a[`${prefix}_bonus_id`]);
        }
        return acc;
      }, []);
      setAttrs({ bonus_ids_output: bonusRowIds.toString() }, {}, () =>
        combineCombat(bonusRowIds)
      );
      // combineCombat(bonusRowIds);
    });
  });
}

on("change:repeating_bonusselections:enabled", (e) => {
  console.log("change:repeating_bonusselections:enabled", e);
  aggregateBonuses();
});

function insertSelection(name, bonusRowId) {
  console.log("insertSelection", name, bonusRowId);
  const selectionRowId = generateRowID();
  const attrs = {};
  attrs[`repeating_bonusselections_${selectionRowId}_bonus_id`] = bonusRowId;
  attrs[`repeating_bonusselections_${selectionRowId}_name`] = name;
  attrs[`repeating_bonuses_${bonusRowId}_selection_id`] = selectionRowId;
  console.log(attrs);
  setAttrs(attrs);
}

function updateSelection(name, selectionRowId) {
  console.log("updateSelection", selectionRowId, name);
  const attrs = {};
  attrs[`repeating_bonusselections_${selectionRowId}_name`] = name;
  setAttrs(attrs);
}

on("change:repeating_bonuses:name", (e) => {
  console.log("change:repeating_bonuses:name", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const selectionIdKey = `repeating_bonuses_${rowId}_selection_id`;
  getAttrs([selectionIdKey], (a) => {
    console.log(a);
    if (a[selectionIdKey]) {
      updateSelection(e.newValue, a[selectionIdKey]);
    } else {
      insertSelection(e.newValue, rowId);
    }
  });
});
