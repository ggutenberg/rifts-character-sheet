async function iqBonus(value, prefix = "") {
  const iq_bonus = value > 15 ? value - 14 : 0;
  const perception_bonus = getBiAttributeBonus(value);
  await setAttrsAsync({
    [`${prefix}iq_bonus`]: iq_bonus,
    [`${prefix}perception_bonus`]: perception_bonus,
  });
  // @todo this should check and only get called if the default (top) profile changes
  await updateSkills();
}

async function mePpPeBonus(attribute, value, prefix = "") {
  console.log("mePpPeBonus", attribute, value, prefix);
  const bonus = getBiAttributeBonus(value);
  const attrs = {};
  attrs[`${prefix}${attribute}_bonus`] = bonus;
  if (attribute.endsWith("pe")) {
    attrs[`${prefix}pe_coma_bonus`] =
      value >= 16
        ? value <= 18
          ? 4 + (value - 16)
          : value <= 30
          ? 8 + (value - 19) * 2
          : 30 + (value - 30)
        : 0;
  }
  await setAttrsAsync(attrs);
}

async function maBonus(value, prefix = "") {
  const ma_bonus =
    value >= 16
      ? value <= 24
        ? 40 + (value - 16) * 5
        : value <= 27
        ? 80 + (value - 24) * 4
        : value <= 29
        ? 92 + (value - 27) * 2
        : 97
      : 0;
  setAttrs({
    [`${prefix}ma_bonus`]: ma_bonus,
    [`${prefix}trust_intimidate`]: ma_bonus,
  });
}

async function psBonus(prefix = "") {
  const a = await getAttrsAsync([`${prefix}ps`, `${prefix}character_ps_type`]);
  const ps = a[`${prefix}ps`];
  const ps_type = a[`${prefix}character_ps_type`];
  const ps_bonus = ps > 15 ? ps - 15 : 0;

  let restrained_punch = (punch = power_punch = kick = leap_kick = "");
  let restrained_punch_unit =
    (punch_unit =
    power_punch_unit =
    kick_unit =
    leap_kick_unit =
      "sdc");

  switch (ps_type) {
    case "1":
      punch = "1D4";
      kick = "1D4";
      break;
    case "2":
      if (ps < 24) {
        // nop
      } else if (ps == 24) {
        power_punch = "1";
        power_punch_unit = "mdc";
      } else if (ps <= 27) {
        power_punch = "1D4";
        power_punch_unit = "mdc";
      } else if (ps <= 30) {
        power_punch = "1D6";
        power_punch_unit = "mdc";
      } else if (ps <= 40) {
        power_punch = "2D4";
        power_punch_unit = "mdc";
      } else if (ps <= 50) {
        restrained_punch = "3D6";
        punch = "1D4";
        punch_unit = "mdc";
        power_punch = "3D4";
        power_punch_unit = "mdc";
      } else {
        restrained_punch = "4D6";
        punch = "1D8";
        punch_unit = "mdc";
        power_punch = "4D4";
        power_punch_unit = "mdc";
      }
      break;
    case "3":
      if (ps <= 15) {
        restrained_punch = "1D6";
        punch = "2D6";
        power_punch = "4D6";
        kick = "2D6";
        leap_kick = "3D6";
      } else if (ps <= 20) {
        restrained_punch = "2D6";
        punch = "1";
        power_punch = "1D6";
        kick = "1D4";
        leap_kick = "2D4";
        punch_unit = power_punch_unit = kick_unit = leap_kick_unit = "mdc";
      } else if (ps <= 25) {
        restrained_punch = "6D6";
        punch = "1D4";
        power_punch = "2D4";
        kick = "1D6";
        leap_kick = "2D6";
        punch_unit = power_punch_unit = kick_unit = leap_kick_unit = "mdc";
      } else if (ps <= 30) {
        restrained_punch = "1D4";
        punch = "1D6";
        power_punch = "2D6";
        kick = "2D4";
        leap_kick = "2D8";
        restrained_punch_unit =
          punch_unit =
          power_punch_unit =
          kick_unit =
          leap_kick_unit =
            "mdc";
      } else if (ps <= 35) {
        restrained_punch = "1D4";
        punch = "2D4";
        power_punch = "4D4";
        kick = "2D8";
        leap_kick = "4D8";
        restrained_punch_unit =
          punch_unit =
          power_punch_unit =
          kick_unit =
          leap_kick_unit =
            "mdc";
      } else if (ps <= 40) {
        restrained_punch = "1D4";
        punch = "2D6";
        power_punch = "4D6";
        kick = "3D8";
        leap_kick = "5D8";
        restrained_punch_unit =
          punch_unit =
          power_punch_unit =
          kick_unit =
          leap_kick_unit =
            "mdc";
      } else if (ps <= 50) {
        restrained_punch = "1D6";
        punch = "3D6";
        power_punch = "1D6*10";
        kick = "5D8";
        leap_kick = "1D8*10";
        restrained_punch_unit =
          punch_unit =
          power_punch_unit =
          kick_unit =
          leap_kick_unit =
            "mdc";
      } else {
        restrained_punch = "2D6";
        punch = "6D6";
        power_punch = "2D6*10";
        kick = "6D8";
        leap_kick = "2D6*10";
        restrained_punch_unit =
          punch_unit =
          power_punch_unit =
          kick_unit =
          leap_kick_unit =
            "mdc";
      }
      break;
    case "4":
      if (ps <= 15) {
        restrained_punch = "1D6";
        punch = "4D6";
        power_punch = "1D4";
        power_punch_unit = "mdc";
      } else if (ps <= 20) {
        restrained_punch = "3D6";
        punch = "1D6";
        power_punch = "2D6";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 25) {
        restrained_punch = "4D6";
        punch = "2D6";
        power_punch = "4D6";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 30) {
        restrained_punch = "5D6";
        punch = "3D6";
        power_punch = "6D6";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 35) {
        restrained_punch = "5D6";
        punch = "4D6";
        power_punch = "1D4*10";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 40) {
        restrained_punch = "6D6";
        punch = "5D6";
        power_punch = "1D6*10";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 50) {
        restrained_punch = "1D6*10";
        punch = "6D6";
        power_punch = "2D4*10";
        punch_unit = power_punch_unit = "mdc";
      } else if (ps <= 60) {
        restrained_punch = "1D6";
        punch = "1D6*10";
        power_punch = "2D6*10";
        restrained_punch_unit = punch_unit = power_punch_unit = "mdc";
      } else {
        // > 60
        const extra = Math.ceil((ps - 60) / 10) * 10;
        restrained_punch = "1D6";
        punch = `1D6*10+${extra}`;
        power_punch = `2D6*10+${extra * 2}`;
        restrained_punch_unit = punch_unit = power_punch_unit = "mdc";
      }
      break;
  }
  const attrs = {
    [`${prefix}ps_bonus`]: ps_bonus,
    [`${prefix}restrained_punch`]: restrained_punch,
    [`${prefix}punch`]: punch,
    [`${prefix}power_punch`]: power_punch,
    [`${prefix}kick`]: kick,
    [`${prefix}leap_kick`]: leap_kick,
    [`${prefix}restrained_punch_unit`]: restrained_punch_unit,
    [`${prefix}punch_unit`]: punch_unit,
    [`${prefix}power_punch_unit`]: power_punch_unit,
    [`${prefix}kick_unit`]: kick_unit,
    [`${prefix}leap_kick_unit`]: leap_kick_unit,
  };
  await setAttrsAsync(attrs);
}

async function pbBonus(value, prefix = "") {
  const pb_bonus =
    value >= 16
      ? value <= 26
        ? 30 + (value - 16) * 5
        : value <= 28
        ? 80 + (value - 26) * 3
        : value == 29
        ? 90
        : 92
      : 0;
  await setAttrsAsync({
    [`${prefix}pb_bonus`]: pb_bonus,
    [`${prefix}charm_impress`]: pb_bonus,
  });
}

async function spdBonus(value) {
  const orderedSectionIds = await getSectionIDsOrderedAsync("profiles");
  const a = await getAttrsAsync([
    `repeating_profiles_${orderedSectionIds[0]}_attacks`,
  ]);
  const feetPerMelee = value * 15;
  const attrs = {
    run_mph: ((feetPerMelee * 4 * 60) / 5280).toFixed(1),
    run_ft_melee: feetPerMelee,
    run_ft_attack: Math.round(
      feetPerMelee / a[`repeating_profiles_${orderedSectionIds[0]}_attacks`]
    ),
  };
  await setAttrsAsync(attrs);
}

on("change:iq", async (e) => {
  await iqBonus(e.newValue);
});

on("change:me change:pp change:pe", async (e) => {
  await mePpPeBonus(e.sourceAttribute, e.newValue);
});

on("change:ma", async (e) => {
  await maBonus(e.newValue);
});

on("change:ps change:character_ps_type", async (e) => {
  await psBonus();
});

on("change:pb", async (e) => {
  await pbBonus(e.newValue);
});

on("change:spd", async (e) => {
  await spdBonus(e.newValue);
  return;
  getAttrs(["combat_combined_attacks"], (a) => {
    const feetPerMelee = e.newValue * 15;
    const attrs = {
      run_mph: ((feetPerMelee * 4 * 60) / 5280).toFixed(1),
      run_ft_melee: feetPerMelee,
      run_ft_attack: Math.round(feetPerMelee / a.combat_combined_attacks),
    };
    setAttrs(attrs);
  });
});
