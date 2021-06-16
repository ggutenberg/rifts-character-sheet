on("clicked:repeating_magic:usespell", (e) => {
  console.log(e);
  getAttrs(["repeating_magic_ppe", "currentppe"], (a) => {
    console.log(a);
    setAttrs({ currentppe: a.currentppe - a.repeating_magic_ppe });
  });
});

on("clicked:resetppe", (e) => {
  console.log(e);
  getAttrs(["character_ppe"], (a) => {
    setAttrs({ currentppe: a.character_ppe });
  });
});
