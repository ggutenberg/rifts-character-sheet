on("change:repeating_movement:mph", (e) => {
  getAttrs(["combat_combined_attacks"], (a) => {
    const feetPerMelee = Math.round((e.newValue * 5280) / 60 / 4);
    const attrs = {
      repeating_movement_ft_melee: feetPerMelee,
      repeating_movement_ft_attack: Math.round(
        feetPerMelee / a.combat_combined_attacks
      ),
    };
    setAttrs(attrs);
  });
});

on("change:repeating_movement:ft_melee", (e) => {
  getAttrs(["combat_combined_attacks"], (a) => {
    const feetPerMelee = e.newValue;
    //const mph = Math.round((feetPerMelee * 4 * 60) / 5280);
    const mph = ((feetPerMelee * 4 * 60) / 5280).toFixed(1);
    const attrs = {
      repeating_movement_mph: mph,
      repeating_movement_ft_attack: Math.round(
        feetPerMelee / a.combat_combined_attacks
      ),
    };
    setAttrs(attrs);
  });
});
