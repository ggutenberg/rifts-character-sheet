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

  const repeatingSections = {
    wp: {
      skill: "",
      strike: "",
      parry: "",
      disarm: "",
      throw: "",
      entangle: "",
      rof: "",
      skill_level: "",
    },
    wpmodern: {
      skill: "",
      strike_range_single: "",
      burst: "",
      skill_level: "",
    },
    skills: {
      skill: "",
      category: "",
      base: "",
      bonus: "",
      perlevel: "",
      skilllevel: "",
      total: "",
      description: "",
    },
  };

  on("clicked:import", (e) => {
    console.log("import", e);
  });

  function getRepeatingAttributeNames(section, callback) {
    getSectionIDs(section, (ids) => {
      const attrNames = ids.reduce((acc, id) => {
        Object.keys(repeatingSections[section]).forEach((key) => {
          acc.push(`repeating_${section}_${id}_${key}`);
        });
        return acc;
      }, []);
      callback(attrNames);
    });
  }

  on("clicked:export", (e) => {
    console.log("export", e);
    let attrNames = [];
    getRepeatingAttributeNames("wp", (wpAttrNames) => {
      getRepeatingAttributeNames("wpmodern", (wpmodernAttrNames) => {
        getRepeatingAttributeNames("skills", (skillsAttrNames) => {
          const attrNames = Object.keys(attributes).concat(
            wpAttrNames,
            wpmodernAttrNames,
            skillsAttrNames
          );
          console.log(attrNames);
          getAttrs(attrNames, (a) => {
            console.log(a);
            setAttrs({ importexport: JSON.stringify(a, null, 2) });
          });
        });
      });
    });
  });
})();
