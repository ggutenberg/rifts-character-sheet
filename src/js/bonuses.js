/**
 * @todo same issue as in movement.js - which profile takes precedence?
 */
on("change:repeating_profiles:attacks", async (e) => {
  console.log("change:repeating_profiles:attacks", e);
  const movementIds = await getSectionIDsAsync("movement");
  const attrNames = movementIds.map(
    (id) => `repeating_movement_${id}_ft_melee`
  );
  const attrs = {};
  const a = await getAttrsAsync(attrNames.concat(["run_ft_melee"]));
  attrs.run_ft_attack = Math.round(a.run_ft_melee / e.newValue);
  movementIds.forEach((id) => {
    const row = `repeating_movement_${id}`;
    const feetPerMelee = a[`${row}_ft_melee`] || 0;
    if (feetPerMelee) {
      attrs[`${row}_ft_attack`] = Math.round(feetPerMelee / e.newValue);
    }
  });
  await setAttrsAsync(attrs);
});

async function addStrikeRangeToCombinedAsync(rowPrefix) {
  console.log("addStrikeRangeToCombinedAsync", rowPrefix);
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
  console.log(attrs);
  await setAttrsAsync(attrs);
}

async function repeatingAbsoluteAttributes(rowIds, destinationPrefix) {
  console.log("repeatingAbsoluteAttributes", rowIds, destinationPrefix);
  const fields = [
    "iq",
    "me",
    "ma",
    "ps",
    "pp",
    "pe",
    "pb",
    "spd",
    "hf",
    "spellstrength",
    "trustintimidate",
    "charmimpress",
  ];
  const fieldNames = rowIds.reduce((acc, rowId) => {
    const absFieldNames = fields.map(
      (f) => `repeating_bonuses_${rowId}_${f}_abs`
    );
    const attFieldNames = fields.map(
      (f) => `repeating_bonuses_${rowId}_mod_${f}`
    );
    return acc.concat(absFieldNames, attFieldNames);
  }, []);
  const a = await getAttrsAsync(fieldNames);

  fields.forEach(async (field) => {
    let fieldAbsValue = null;
    rowIds.forEach((rowId) => {
      const rowFieldAbs = a[`repeating_bonuses_${rowId}_${field}_abs`];
      if (Boolean(Number(rowFieldAbs)) == true) {
        rowFieldValue = a[`repeating_bonuses_${rowId}_mod_${field}`];
        fieldAbsValue =
          fieldAbsValue > rowFieldValue ? fieldAbsValue : rowFieldValue;
      }
    });
    if (fieldAbsValue) {
      // compare the modified absolute value against the original attribute
      const coreValue = (await getAttrsAsync([field]))[field];
      const newValue = coreValue > fieldAbsValue ? coreValue : fieldAbsValue;
      const attr = {
        [`${destinationPrefix}_mod_${field}`]: newValue,
      };
      await setAttrsAsync(attr);
    } else {
      // repeatingSum
      const rsaDestinations = [`${destinationPrefix}_mod_${field}`];
      const rsaFields = [`mod_${field}`];
      let base = field;
      if (field == "trustintimidate") {
        base = `${destinationPrefix}_mod_ma_bonus`;
      } else if (field == "charmimpress") {
        base = `${destinationPrefix}_mod_pb_bonus`;
      }
      await repeatingSumAsync(
        rsaDestinations,
        "bonuses",
        rsaFields,
        `filter:${rowIds.toString()}`,
        base
      );
    }
  });
}

async function combineBonuses(rowIds, destinationPrefix) {
  // we need to combine the values of each repeated attribute within
  // each of the sectionIds and aggregate them in the combined combat section
  // +PP +PS, and add a saving throws section with +ME +PE

  console.log("combineBonuses", rowIds, destinationPrefix);

  await repeatingAbsoluteAttributes(rowIds, destinationPrefix);

  await repeatingStringConcatAsync({
    destinations: [
      `${destinationPrefix}_damage`,
      `${destinationPrefix}_damage_range`,
    ],
    section: "bonuses",
    fields: ["damage", "damage_range"],
    filter: rowIds,
  });

  const pickBestFieldsBase = [
    "ar",
    "critical",
    "knockout",
    "deathblow",
    "mod_character_ps_type",
  ];
  const pickBestDestinations = pickBestFieldsBase.map(
    (field) => `${destinationPrefix}_${field}`
  );
  const pickBestFields = pickBestFieldsBase;
  const core = await getAttrsAsync(["character_ps_type"]);
  await repeatingPickBestAsync({
    destinations: pickBestDestinations,
    section: "bonuses",
    fields: pickBestFields,
    defaultValues: [0, 20, 0, 0, core.character_ps_type],
    ranks: ["high", "low", "low", "low", "high", "high"],
    filter: rowIds,
  });

  const noAttributeBonusFields = [
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
  ];
  // No attribute bonuses.
  await repeatingSumAsync(
    noAttributeBonusFields.map((field) => `${destinationPrefix}_${field}`),
    "bonuses",
    noAttributeBonusFields,
    `filter:${rowIds.toString()}`
  );
  await addStrikeRangeToCombinedAsync(destinationPrefix);

  await repeatingSumAsync(
    [`${destinationPrefix}_hp`],
    "bonuses",
    ["hp"],
    `filter:${rowIds.toString()}`,
    "character_hp"
  );

  await repeatingSumAsync(
    [`${destinationPrefix}_sdc`],
    "bonuses",
    ["sdc"],
    `filter:${rowIds.toString()}`,
    "character_sdc"
  );

  await repeatingSumAsync(
    [`${destinationPrefix}_mdc`],
    "bonuses",
    ["mdc"],
    `filter:${rowIds.toString()}`,
    "character_mdc"
  );

  await repeatingSumAsync(
    [`${destinationPrefix}_ppe`],
    "bonuses",
    ["ppe"],
    `filter:${rowIds.toString()}`,
    "character_ppe"
  );

  await repeatingSumAsync(
    [`${destinationPrefix}_isp`],
    "bonuses",
    ["isp"],
    `filter:${rowIds.toString()}`,
    "character_isp"
  );

  await repeatingSumAsync(
    [`${destinationPrefix}_mod_skillbonus`],
    "bonuses",
    ["mod_skillbonus"],
    `filter:${rowIds.toString()}`
  );

  const ppBonusFields = [
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
  ];
  await repeatingSumAsync(
    ppBonusFields.map((field) => `${destinationPrefix}_${field}`),
    "bonuses",
    ppBonusFields,
    `filter:${rowIds.toString()}`,
    `${destinationPrefix}_mod_pp_bonus`
  );

  // Saving Throws
  Object.entries(SAVE_KEYS_ATTRIBUTE_BONUSES).forEach(
    async ([attributeBonus, saves]) => {
      const destinations = saves.map((save) => `${destinationPrefix}_${save}`);
      const section = "bonuses";
      const fields = saves;
      await repeatingSumAsync(
        destinations,
        section,
        fields,
        `filter:${rowIds.toString()}`,
        `${destinationPrefix}_mod_${attributeBonus}`
      );
    }
  );
}

async function removeBonusSelectionsRowAsync(bonusRowId) {
  const a = await getAttrsAsync([
    `repeating_bonuses_${bonusRowId}_selection_id`,
  ]);
  removeRepeatingRow(
    `repeating_bonusselections_${
      a[`repeating_bonuses_${bonusRowId}_selection_id`]
    }`
  );
}

async function removeBonusRowsAsync(bonusRowId) {
  await removeBonusSelectionsRowAsync(bonusRowId);
  removeRepeatingRow(`repeating_bonuses_${bonusRowId}`);
}

on("remove:repeating_wp remove:repeating_wpmodern", async (e) => {
  console.log("remove wp", e);
  // const [r, section, rowId] = e.sourceAttribute.split('_');
  const bonusRowId = e.removedInfo[`${e.sourceAttribute}_bonus_id`];
  await removeBonusRowsAsync(bonusRowId);
});

async function outputSelectedBonusIds() {
  const bonusselectionsIds = await getSectionIDsAsync("bonusselections");
  const checkboxNames = bonusselectionsIds.map(
    (id) => `repeating_bonusselections_${id}_enabled`
  );
  const bonusIdNames = bonusselectionsIds.map(
    (id) => `repeating_bonusselections_${id}_bonus_id`
  );
  const attrNames = checkboxNames.concat(bonusIdNames);
  const a = await getAttrsAsync(attrNames);
  const bonusRowIds = bonusselectionsIds.reduce((acc, id) => {
    const prefix = `repeating_bonusselections_${id}`;
    if (Boolean(Number(a[`${prefix}_enabled`])) == true) {
      acc.push(a[`${prefix}_bonus_id`]);
    }
    return acc;
  }, []);
  await setAttrsAsync({ bonus_ids_output: bonusRowIds.toString() });
}

on("change:repeating_bonusselections:enabled", async (e) => {
  console.log("change:repeating_bonusselections:enabled", e);
  await outputSelectedBonusIds();
});

async function insertSelection(name, bonusRowId) {
  console.log("insertSelection", name, bonusRowId);
  const selectionRowId = generateRowID();
  const attrs = {};
  attrs[`repeating_bonusselections_${selectionRowId}_bonus_id`] = bonusRowId;
  attrs[`repeating_bonusselections_${selectionRowId}_name`] = name;
  attrs[`repeating_bonuses_${bonusRowId}_selection_id`] = selectionRowId;
  console.log(attrs);
  await setAttrsAsync(attrs);
}

async function updateSelection(name, selectionRowId) {
  console.log("updateSelection", name, selectionRowId);
  const attrs = {};
  attrs[`repeating_bonusselections_${selectionRowId}_name`] = name;
  await setAttrsAsync(attrs);
}

on("change:repeating_bonuses:name", async (e) => {
  console.log("change:repeating_bonuses:name", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  const selectionIdKey = `repeating_bonuses_${rowId}_selection_id`;
  const a = await getAttrsAsync([selectionIdKey]);
  console.log(a);
  if (a[selectionIdKey]) {
    await updateSelection(e.newValue, a[selectionIdKey]);
  } else {
    await insertSelection(e.newValue, rowId);
  }
});

on("change:repeating_profiles:name", async (e) => {
  console.log("change:repeating_profiles:name", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  await setAttrsAsync({
    repeating_profiles_rowid: `${r}_${section}_${rowId}_`,
  });
});

on("change:repeating_profiles:mod_iq", async (e) => {
  console.log("change:repeating_profiles:mod_iq", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  await iqBonus(e.newValue, `${r}_${section}_${rowId}_mod_`);
});

on(
  "change:repeating_profiles:mod_me \
  change:repeating_profiles:mod_pp \
  change:repeating_profiles:mod_pe",
  async (e) => {
    await mePpPeBonus(e.sourceAttribute, e.newValue);
  }
);

on("change:repeating_profiles:mod_ma", async (e) => {
  console.log("change:repeating_profiles:mod_ma", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  await maBonus(e.newValue, `${r}_${section}_${rowId}_mod_`);
});

on(
  "change:repeating_profiles:mod_ps \
  change:repeating_profiles:mod_character_ps_type",
  async (e) => {
    console.log("change:repeating_profiles:mod_ps", e);
    const [r, section, rowId] = e.sourceAttribute.split("_");
    await psBonusComplete(`${r}_${section}_${rowId}_mod_`);
  }
);

on("change:repeating_profiles:mod_pb", async (e) => {
  console.log("change:repeating_profiles:mod_pb", e);
  const [r, section, rowId] = e.sourceAttribute.split("_");
  await pbBonus(e.newValue, `${r}_${section}_${rowId}_mod_`);
});
