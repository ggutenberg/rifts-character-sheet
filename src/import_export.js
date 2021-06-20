(function () {
  const attributes = {
    character_name: "",
    truename_name: "",
    character_race: "",
    occ: "",
    ps_type: "",
    level: "",
    experience: "",
    alignment: "",
    character_age: "",
    character_gender: "",
    character_height: "",
    character_weight: "",
    character_familyorigin: "",
    character_environment: "",
    character_languages: "",
    character_insanity: "",
    character_disposition: "",
    iq: "",
    iq_bonus: "",
    perception_bonus: "",
    me: "",
    me_bonus: "",
    ma: "",
    ma_bonus: "",
    ps: "",
    ps_bonus: "",
    pp: "",
    pp_bonus: "",
    pe: "",
    pe_bonus: "",
    pe_coma_bonus: "",
    pb: "",
    pb_bonus: "",
    spd: "",
    trust_intimidate: "",
    charm_impress: "",
    restrained_punch: "",
    restrained_punch_unit: "",
    punch: "",
    punch_unit: "",
    power_punch: "",
    power_punch_unit: "",
    kick: "",
    kick_unit: "",
    leap_kick: "",
    leap_kick_unit: "",
    lift: "",
    carry: "",
    throw: "",
    carry_max: "",
    carry_running: "",
    hold_max: "",
    character_hp: "",
    character_sdc: "",
    character_ar: "",
    character_mdc: "",
    character_ppe: "",
    character_isp: "",
    character_hf: "",
    perception: "",
    run_mph: "",
    run_ft_melee: "",
    run_ft_attack: "",
    run_cruising: "",
    run_at_max: "",
    leapup: "",
    leapout: "",
  };

  const wp = {
    skill: "",
    strike: "",
    parry: "",
    disarm: "",
    throw: "",
    entangle: "",
    rof: "",
    skill_level: "",
  };

  const wpmodern = {
    skill: "",
    strike_range_single: "",
    burst: "",
    skill_level: "",
  };

  on("clicked:import", (e) => {
    console.log("import", e);
  });

  on("clicked:export", (e) => {
    console.log("export", e);
    getAttrs(Object.keys(attributes), (a) => {
      console.log(a);
      setAttrs({ importexport: JSON.stringify(a, null, 2) });
      // Object.keys(attributes).forEach(
      //   (attribute) => (attributes[attribute] = a[attribute])
      // );
      // console.log(attributes);
    });
  });
})();
