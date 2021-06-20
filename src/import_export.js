(function () {
  on("clicked:import", (e) => {
    console.log("import", e);
  });

  function getRepeatingRows(section, callback) {
    getSectionIDs(section, (ids) => {
      const attrNames = ids.reduce((acc, id) => {
        SECTIONS[section].forEach((key) => {
          acc.push(`repeating_${section}_${id}_${key}`);
        });
        return acc;
      }, []);
      //   callback(attrNames, ids);
      getRepeatingSectionArray(section, ids, attrNames, callback);
    });
  }

  function getRepeatingSectionArray(section, rowIds, attrNames, callback) {
    let sectionArray = [];
    getAttrs(attrNames, (attrs) => {
      console.log(attrs);
      rowIds.forEach((rowId) => {
        const wpObj = Object.keys(attrs).reduce((acc, attr) => {
          if (attr.includes(rowId)) {
            acc[attr.replace(`repeating_${section}_${rowId}_`, "")] =
              attrs[attr];
          }
          return acc;
        }, {});
        sectionArray.push(wpObj);
      });
      console.log(sectionArray);
      callback(sectionArray);
    });
  }

  on("clicked:export", (e) => {
    console.log("export", e);
    const attrs = {};
    getRepeatingRows("wp", (wpSectionArray) => {
      attrs.wp = wpSectionArray;

      getRepeatingRows("wpmodern", (wpmodernSectionArray) => {
        attrs.wpmodern = wpmodernSectionArray;

        getRepeatingRows("skills", (skillsSectionArray) => {
          attrs.skills = skillsSectionArray;

          getRepeatingRows("combat", (combatSectionArray) => {
            attrs.combat = combatSectionArray;

            getRepeatingRows("magic", (magicSectionArray) => {
              attrs.magic = magicSectionArray;

              getRepeatingRows("psionics", (psionicsSectionArray) => {
                attrs.psionics = psionicsSectionArray;

                getAttrs(CORE_KEYS, (coreAttrs) => {
                  Object.entries(coreAttrs).forEach(
                    ([key, val]) => (attrs[key] = val)
                  );

                  console.log(attrs);
                  setAttrs({ importexport: JSON.stringify(attrs, null, 2) });
                });
              });
            });
          });
        });
      });
    });
  });
})();
