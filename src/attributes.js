on("change:iq", (e) => {
  const iq_bonus = e.newValue > 15 ? e.newValue - 14 : 0;
  const perception_bonus = getBiAttributeBonus(e.newValue);
  setAttrs({ iq_bonus, perception_bonus });
});

on("change:me change:pp change:pe", (e) => {
  const bonus = getBiAttributeBonus(e.newValue);
  const attrs = {};
  attrs[`${e.sourceAttribute}_bonus`] = bonus;
  if (e.sourceAttribute == "pe") {
    attrs["pe_coma_bonus"] =
      e.newValue >= 16
        ? e.newValue <= 18
          ? 4 + (e.newValue - 16)
          : e.newValue <= 30
          ? 8 + (e.newValue - 19) * 2
          : 30 + (e.newValue - 30)
        : 0;
  }
  setAttrs(attrs, {}, aggregateBonuses);
});

on("change:ma", (e) => {
  const ma_bonus =
    e.newValue >= 16
      ? e.newValue <= 24
        ? 40 + (e.newValue - 16) * 5
        : e.newValue <= 27
        ? 80 + (e.newValue - 24) * 4
        : e.newValue <= 29
        ? 92 + (e.newValue - 27) * 2
        : 97
      : 0;
  setAttrs({ ma_bonus, trust_intimidate: ma_bonus });
});

on("change:ps change:ps_type", (e) => {
  getAttrs(["ps", "ps_type"], (a) => {
    const ps = a.ps;
    const ps_type = a.ps_type;
    const ps_bonus = ps > 15 ? ps - 15 : 0;

    let restrained_punch = (punch = power_punch = kick = leap_kick = "");
    let restrained_punch_unit =
      (punch_unit =
      power_punch_unit =
      kick_unit =
      leap_kick_unit =
        "sdc");

    switch (ps_type) {
      case "normal":
        punch = "1D4";
        kick = "1D4";
        break;
      case "augmented":
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
      case "robotic":
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
      case "supernatural":
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
      ps_bonus,
      restrained_punch,
      punch,
      power_punch,
      kick,
      leap_kick,
      restrained_punch_unit,
      punch_unit,
      power_punch_unit,
      kick_unit,
      leap_kick_unit,
    };
    console.log(attrs);
    setAttrs(attrs);
  });
});

on("change:pb", (e) => {
  const pb_bonus =
    e.newValue >= 16
      ? e.newValue <= 26
        ? 30 + (e.newValue - 16) * 5
        : e.newValue <= 28
        ? 80 + (e.newValue - 26) * 3
        : e.newValue == 29
        ? 90
        : 92
      : 0;
  setAttrs({ pb_bonus, charm_impress: pb_bonus });
});

on("change:spd", (e) => {
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
